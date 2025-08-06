import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import { SQL } from "drizzle-orm";
import { ChatSDKError } from "../errors";
import { db } from "./drizzle";
import { chat, Chat, complaint, Customer, customer, document, employee, Employee, Message, message, stream, suggestion, Suggestion } from "./schema";
import { UserType } from "@/app/(auth)/auth";
import { ArtifactKind } from "@/components/artifact";

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

    return selectedDocument;
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
    const updateData: any = {
      updatedAt: new Date(),
      description,
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

export async function submitComplaint({ id }: { id: string }) {
  try {
    return await db
      .update(complaint)
      .set({
        isDraft: false,
        status: 'open',
        updatedAt: new Date(),
      })
      .where(eq(complaint.id, id));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to submit complaint');
  }
}

export async function assignComplaintToEmployee({
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