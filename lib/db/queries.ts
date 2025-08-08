import { and, asc, desc, eq, gt, lt, min, sql } from "drizzle-orm";
import { SQL } from "drizzle-orm";
import { ChatSDKError } from "../errors";
import { db } from "./drizzle";
import { chat, Chat, complaint, complaintAssignment, complaintCategory, complaintSubCategory, Customer, customer, document, employee, Employee, Message, message, stream, suggestion, Suggestion, workspace, Workspace } from "./schema";
import { UserType } from "@/app/(auth)/auth";
import { ArtifactKind } from "@/components/artifact";
import { stat } from "fs";

// ===================================== Customer =====================================
export async function getCustomer(id: number): Promise<Array<Customer>> {
  try {
    return await db.select().from(customer).where(eq(customer.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Customer with id ' + id + ' not found',
    );
  }
}

export async function getCustomerByEmail(email: string): Promise<Array<Customer>> {
  try {
    return await db.select().from(customer).where(eq(customer.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Customer with email ' + email + ' not found',
    );
  }
}

// ===================================== Employee =====================================
export async function getEmployee(id: number): Promise<Array<Employee>> {
  try {
    return await db.select().from(employee).where(eq(employee.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Employee with id ' + id + ' not found',
    );
  }
}

export async function getEmployeeByEmail(email: string): Promise<Array<Employee>> {
  try {
    return await db.select().from(employee).where(eq(employee.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Employee with email ' + email + ' not found',
    );
  }
}

// ===================================== Chat =====================================
export async function saveChat({
  id,
  userId,
  userType,
  title,
}: {
  id: string;
  userId: number;
  userType: UserType;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      customerId: userType === 'customer' ? userId : null,
      employeeId: userType === 'employee' ? userId : null,
      title,
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function getChatsByUserId({
  id,
  userType,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: number;
  userType: UserType;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, userType === 'customer' ? eq(chat.customerId, id) : eq(chat.employeeId, id))
            : userType === 'customer' ? eq(chat.customerId, id) : eq(chat.employeeId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function updateChatTitle({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  try {
    return await db
      .update(chat)
      .set({
        title,
        updatedAt: new Date(),
      })
      .where(eq(chat.id, id));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to update chat title');
  }
}

export async function updateChatIsDraft({
  id,
  isDraft,
}: {
  id: string;
  isDraft: boolean;
}) {
  try {
    return await db
      .update(chat)
      .set({
        isDraft,
        updatedAt: new Date(),
      })
      .where(eq(chat.id, id));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to update chat draft status');
  }
}

// ===================================== Message =====================================
export async function saveMessages({
  messages,
}: {
  messages: Array<Message>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

// ===================================== Stream =====================================
export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

// ===================================== Document =====================================
export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
  userType,
  chatId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: number;
  userType: UserType;
  chatId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        customerId: userType === 'customer' ? userId : null,
        employeeId: userType === 'employee' ? userId : null,
        chatId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument || null;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

// ===================================== Suggestion =====================================
export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

// ===================================== Complaint =====================================

export async function createDraftComplaint({
  id,
  customerId,
  chatId,
}: {
  id: string;
  customerId: number;
  chatId: string;
}) {
  try {
    const result = await db.insert(complaint).values({
      id,
      customerId,
      chatId,
    }).returning();

    return result[0];
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create draft complaint');
  }
}

export async function updateComplaintField({
  id,
  field,
  value,
}: {
  id: string;
  field: string;
  value: string | null;
}) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    updateData[field] = value;

    return await db
      .update(complaint)
      .set({
        ...updateData,
      })
      .where(eq(complaint.id, id));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to update complaint field');
  }
}

export async function saveComplaintDetails({
  id,
  description,
  additionalDetails,
  attachmentUrls,
  desiredResolution,
}: {
  id: string;
  description: string;
  additionalDetails?: string;
  attachmentUrls?: string;
  desiredResolution?: string;
}) {
  try {
    // Get existing complaint to check if it already has a reference number
    const existingComplaint = await getComplaintById(id);
    let referenceNumber = existingComplaint?.referenceNumber;
    
    // Generate reference number if it doesn't exist
    if (!referenceNumber) {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random chars
      referenceNumber = `CMP${timestamp}${random}`;
    }

    const updateData: any = {
      updatedAt: new Date(),
      description,
      referenceNumber,
      isDraft: false, // Mark complaint as submitted
      status: 'open', // Set initial status
    };

    if (additionalDetails !== undefined) {
      updateData.additionalDetails = additionalDetails;
    }
    if (attachmentUrls !== undefined) {
      updateData.attachmentUrls = attachmentUrls;
    }
    if (desiredResolution !== undefined) {
      updateData.desiredResolution = desiredResolution;
    }

    console.log('Updating complaint with reference number:', referenceNumber);

    return await db
      .update(complaint)
      .set(updateData)
      .where(eq(complaint.id, id));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save complaint details');
  }
}

export async function getComplaintById(id: string) {
  try {
    const result = await db
      .select()
      .from(complaint)
      .where(eq(complaint.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get complaint by id',
    );
  }
}

export async function getComplaintByReferenceNum(reference_num: string) {
  try {
    const result = await db
      .select()
      .from(complaint)
      .where(eq(complaint.referenceNumber, reference_num))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get complaint by id',
    );
  }
}

export async function submitComplaint({ 
  id, 
  category, 
  description, 
  additionalDetails, 
  desiredResolution,
  sentiment 
}: { 
  id: string; 
  category?: string;
  description?: string;
  additionalDetails?: string;
  desiredResolution?: string;
  sentiment?: string;
}) {
  try {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random chars
    const referenceNumber = `CMP${timestamp}${random}`;

    await db
      .update(complaint)
      .set({
        referenceNumber,
        category,
        description,
        additionalDetails,
        desiredResolution,
        sentiment,
        isDraft: false,
        status: 'open',
        updatedAt: new Date(),
      })
      .where(eq(complaint.id, id));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to submit complaint');
  }
}

export async function assignComplaintToEmployeeById({
  complaintId,
  employeeId,
}: {
  complaintId: string;
  employeeId: number;
}) {
  try {
    return await db
      .update(complaint)
      .set({
        assignedTo: employeeId,
        status: 'assigned',
        updatedAt: new Date(),
      })
      .where(eq(complaint.id, complaintId));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to assign complaint');
  }
}

export async function assignComplaintToEmployeeByRef({
  referenceNumber,
  employeeId,
}: {
  referenceNumber: string;
  employeeId: number;
}) {
  try {
    return await db
      .update(complaint)
      .set({
        assignedTo: employeeId,
        status: 'assigned',
        updatedAt: new Date(),
      })
      .where(eq(complaint.referenceNumber, referenceNumber));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to assign complaint');
  }
}

export async function findEmployeeByCategory({ category }: { category: string }) {
  try {
    // Map complaint categories to departments
    const categoryToDepartment: Record<string, string> = {
      'Account Issues': 'account_management',
      'Transaction Problems': 'transactions',
      'Service Quality': 'customer_service',
      'Technical Issues': 'it_support',
      'Billing Disputes': 'billing',
      'Security Concerns': 'security',
      'Other': 'general_support',
    };

    const department = categoryToDepartment[category] || 'general_support';

    const result = await db
      .select()
      .from(employee)
      .where(eq(employee.department, department))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to find employee');
  }
}

export async function findEmployeeForAssignment() {
  try {
    // Find available employees with the least current load
    const result = await db
      .select()
      .from(employee)
      .where(eq(employee.isAvailable, true))
      .orderBy(asc(employee.currentLoad))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to find employee for assignment');
  }
}

export async function findLeastLoadedAvailableEmployee() {
  try {
    // Find the minimum current load among available employees
    const minLoadResult = await db
      .select({ minLoad: min(employee.currentLoad) })
      .from(employee)
      .where(eq(employee.isAvailable, true));

    const minLoad = minLoadResult[0]?.minLoad;

    if (minLoad === null || minLoad === undefined) {
      return null;
    }

    // Find all available employees with the minimum load
    const result = await db
      .select()
      .from(employee)
      .where(
        and(
          eq(employee.isAvailable, true),
          eq(employee.currentLoad, minLoad)
        )
      )
      .orderBy(asc(employee.id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to find least loaded available employee');
  }
}

// ===================================== Complaint Assignment =====================================

export async function assignComplaint({
  complaintId,
  employeeId,
  remarks,
}: {
  complaintId: string;
  employeeId: number;
  remarks?: string;
}) {
  try {
    // First, update the complaint status and assignedTo field
    await db
      .update(complaint)
      .set({
        assignedTo: employeeId,
        status: 'assigned',
        updatedAt: new Date(),
      })
      .where(eq(complaint.id, complaintId));

    // Then, create a record in the complaint_assignment table
    const assignmentResult = await db
      .insert(complaintAssignment)
      .values({
        complaintId,
        employeeId,
        assignedAt: new Date(),
        assignmentStatus: 'active',
        remarks,
      })
      .returning();

    // Update employee's current load
    await db
      .update(employee)
      .set({
        currentLoad: sql`${employee.currentLoad} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(employee.id, employeeId));

    return assignmentResult[0];
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to assign complaint');
  }
}

export async function reassignComplaint({
  complaintId,
  newEmployeeId,
  remarks,
}: {
  complaintId: string;
  newEmployeeId: number;
  remarks?: string;
}) {
  try {
    // Get the current assignment to update it
    const currentAssignment = await db
      .select()
      .from(complaintAssignment)
      .where(
        and(
          eq(complaintAssignment.complaintId, complaintId),
          eq(complaintAssignment.assignmentStatus, 'active')
        )
      )
      .limit(1);

    if (currentAssignment.length > 0) {
      // Update the current assignment to mark it as reassigned
      await db
        .update(complaintAssignment)
        .set({
          unassignedAt: new Date(),
          assignmentStatus: 'reassigned',
        })
        .where(eq(complaintAssignment.id, currentAssignment[0].id));

      // Decrease the current employee's load
      if (currentAssignment[0].employeeId) {
        await db
          .update(employee)
          .set({
            currentLoad: sql`${employee.currentLoad} - 1`,
            updatedAt: new Date(),
          })
          .where(eq(employee.id, currentAssignment[0].employeeId));
      }
    }

    // Create new assignment
    const assignmentResult = await db
      .insert(complaintAssignment)
      .values({
        complaintId,
        employeeId: newEmployeeId,
        assignedAt: new Date(),
        assignmentStatus: 'active',
        remarks,
      })
      .returning();

    // Update complaint and new employee's load
    await db
      .update(complaint)
      .set({
        assignedTo: newEmployeeId,
        updatedAt: new Date(),
      })
      .where(eq(complaint.id, complaintId));

    await db
      .update(employee)
      .set({
        currentLoad: sql`${employee.currentLoad} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(employee.id, newEmployeeId));

    return assignmentResult[0];
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to reassign complaint');
  }
}

// ===================================== Categories =====================================
export async function getAllCategories() {
  try {
    return await db.select().from(complaintCategory).orderBy(asc(complaintCategory.name));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to fetch categories');
  }
}

export async function getAllSubCategories() {
  try {
    return await db
      .select({
        id: complaintSubCategory.id,
        name: complaintSubCategory.name,
        categoryId: complaintSubCategory.categoryId,
        categoryName: complaintCategory.name,
      })
      .from(complaintSubCategory)
      .innerJoin(complaintCategory, eq(complaintSubCategory.categoryId, complaintCategory.id))
      .orderBy(asc(complaintCategory.name), asc(complaintSubCategory.name));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to fetch subcategories');
  }
}

export async function getCategoriesWithSubCategories() {
  try {
    const categories = await getAllCategories();
    const subCategories = await getAllSubCategories();
    
    // Group subcategories by category
    const categoriesWithSubCategories = categories.map(category => ({
      ...category,
      subCategories: subCategories.filter(sub => sub.categoryId === category.id)
    }));
    
    return categoriesWithSubCategories;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to fetch categories with subcategories');
  }
}

export async function getComplaintsAssignedToEmployee({
  employeeId,
  status,
}: {
  employeeId: number;
  status?: string;
}) {
  try {
    // First, get all active assignments for the employee
    const assignments = await db
      .select({
        complaintId: complaintAssignment.complaintId,
        employeeId: complaintAssignment.employeeId,
        assignedAt: complaintAssignment.assignedAt,
        assignmentStatus: complaintAssignment.assignmentStatus,
        remarks: complaintAssignment.remarks,
      })
      .from(complaintAssignment)
      .where(
        and(
          eq(complaintAssignment.employeeId, employeeId),
          eq(complaintAssignment.assignmentStatus, 'active')
        )
      );

    if (assignments.length === 0) {
      return [];
    }

    // Get the complaint IDs from assignments
    const complaintIds = assignments.map(assignment => assignment.complaintId);

    // Build where conditions for complaints
    const whereConditions = [
      sql`${complaint.id} IN (${sql.join(complaintIds.map(id => sql`${id}`), sql`, `)})`,
      eq(complaint.isDraft, false) // Only include submitted complaints
    ];
    
    if (status && status !== 'all') {
      whereConditions.push(eq(complaint.status, status as any));
    }

    // Get complaint and customer details
    const complaints = await db
      .select({
        id: complaint.id,
        referenceNumber: complaint.referenceNumber,
        description: complaint.description,
        additionalDetails: complaint.additionalDetails,
        category: complaint.category,
        subCategory: complaint.subCategory,
        urgencyLevel: complaint.urgencyLevel,
        status: complaint.status,
        assignedTo: complaint.assignedTo,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        resolvedAt: complaint.resolvedAt,
        customerId: complaint.customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        // Assignment details
        assignedAt: complaintAssignment.assignedAt,
        assignmentRemarks: complaintAssignment.remarks,
      })
      .from(complaint)
      .leftJoin(customer, eq(complaint.customerId, customer.id))
      .leftJoin(complaintAssignment, 
        and(
          eq(complaint.id, complaintAssignment.complaintId),
          eq(complaintAssignment.employeeId, employeeId),
          eq(complaintAssignment.assignmentStatus, 'active')
        )
      )
      .where(and(...whereConditions))
      .orderBy(desc(complaint.createdAt));

    return complaints;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to fetch complaints assigned to employee');
  }
}

// ===================================== Workspace =====================================

export async function getWorkspaceByComplaintId({
  complaintId,
}: {
  complaintId: string;
}) {
  try {
    const result = await db
      .select()
      .from(workspace)
      .where(eq(workspace.complaintId, complaintId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get workspace by complaint id');
  }
}

export async function createWorkspace({
  id,
  chatId,
  employeeId,
  documentId,
  documentCreatedAt,
  complaintId,
}: {
  id: string;
  chatId: string;
  employeeId: number;
  documentId: string | null;
  documentCreatedAt: Date | null;
  complaintId: string;
}) {
  try {
    const result = await db
      .insert(workspace)
      .values({
        id,
        chatId,
        employeeId,
        documentId,
        documentCreatedAt,
        complaintId,
        createdAt: new Date(),
      })
      .returning();

    return result[0];
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create workspace');
  }
}

// Get all complaints assigned to a specific employee
export async function getComplaintsAssignedToEmployeeA(employeeId: number) {
  try {
    return await db
      .select()
      .from(complaint)
      .where(eq(complaint.assignedTo, employeeId));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get assigned complaints');
  }
}

// Get all complaints in the database
export async function getAllComplaints() {
  try {
    return await db.select().from(complaint);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get all complaints');
  }
}

// fetch data with custom query
export async function fetchComplaintsWithQuery(query: string) {
  try {
    console.log('Query executed:', query);
    const result = (await db.execute(query.trim())).rows.map(row => mapRowToComplaint(row));
    console.log('Result:', result);
    return result;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to fetch data with custom query');
  }
}

function mapRowToComplaint(row: any) {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    chatId: row.chat_id,
    customerId: row.customer_id,
    category: row.category,
    subCategory: row.sub_category,
    description: row.description,
    additionalDetails: row.additional_details,
    attachmentUrls: row.attachment_urls,
    desiredResolution: row.desired_resolution,
    sentiment: row.sentiment,
    urgencyLevel: row.urgency_level,
    assistantNotes: row.assistant_notes,
    assignedTo: row.assigned_to,
    isDraft: row.is_draft,
    status: row.status,
    resolutionNotes: row.resolution_notes,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Updates the status, resolution notes, and resolvedAt fields of a complaint.
 * If status is 'resolved', also updates the complaintAssignment table for the complaint.
 * @param complaintId - The ID of the complaint to update
 * @param resolutionNotes - The resolution notes to set
 * @param resolvedAt - The timestamp when the complaint was resolved
 * @param status - The new status for the complaint
 */
export async function updateComplaintStatusById({
  complaintId,
  status,
  resolutionNotes,
}: {
  complaintId: string;
  status: 'open' | 'assigned' | 'in_progress' | 'closed' | 'escalated';
  resolutionNotes?: string;
}) {
  const now = new Date();
  // Build update object
  const updateObj: any = {
    resolvedAt: now,
    status,
  };
  if (typeof resolutionNotes !== 'undefined' && status === 'closed') {
    updateObj.resolutionNotes = resolutionNotes;
  }
  // Update complaint table
  await db.update(complaint)
    .set(updateObj)
    .where(eq(complaint.id, complaintId));

  // If status is 'closed', update complaintAssignment as well
  if (status === 'closed') {
    await db.update(complaintAssignment)
      .set({
        assignedAt: now,
        assignmentStatus: 'closed',
      })
      .where(eq(complaintAssignment.complaintId, complaintId));
  }
}

/**
 * Updates the category and subCategory fields of a complaint by its ID.
 * @param complaintId - The ID of the complaint to update
 * @param category - The new category value
 * @param subCategory - The new subCategory value
 */
export async function updateComplaintCategoryById({
  complaintId,
  category,
  subCategory,
}: {
  complaintId: string;
  category?: string;
  subCategory?: string;
}) {
  // Build update object only with non-empty fields
  const updateObj: Record<string, string> = {};
  if (category && category.trim() !== '') {
    updateObj.category = category;
  }
  if (subCategory && subCategory.trim() !== '') {
    updateObj.subCategory = subCategory;
  }
  if (Object.keys(updateObj).length === 0) return; // Nothing to update
  await db.update(complaint)
    .set(updateObj)
    .where(eq(complaint.id, complaintId));
}
