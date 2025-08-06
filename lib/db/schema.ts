import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar, text, uuid, json, foreignKey, primaryKey, boolean, decimal } from "drizzle-orm/pg-core";

export const customer = pgTable("customer", {
  id: integer("id").primaryKey().notNull().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type Customer = InferSelectModel<typeof customer>;

export const employee = pgTable("employee", {
  id: integer("id").primaryKey().notNull().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  role: varchar("role", { enum: ['csr', 'admin', 'supervisor'] }).notNull(),
  department: varchar("department").notNull(),
  specialization: varchar("specialization").notNull(),
  branch: varchar("branch").notNull(),
  level: varchar("level", { enum: ['junior', 'senior', 'expert'] }).notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  maxLoad: integer("max_load").notNull().default(10),
  currentLoad: integer("current_load").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type Employee = InferSelectModel<typeof employee>;

export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title"),
  customerId: integer("customer_id").references(() => customer.id),
  employeeId: integer("employee_id").references(() => employee.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chat_id").notNull().references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type Message = InferSelectModel<typeof message>;

export const stream = pgTable('stream', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    chatId: uuid('chat_id').notNull().references(() => chat.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  }
);

export type Stream = InferSelectModel<typeof stream>;

export const vote = pgTable(
  'vote',
  {
    chatId: uuid('chat_id')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('message_id')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('is_upvoted').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.chatId, table.messageId] }),
  ],
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    customerId: integer("customer_id").references(() => customer.id),
    employeeId: integer("employee_id").references(() => employee.id),
    chatId: uuid("chat_id").notNull().references(() => chat.id),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.createdAt] }),
  ],
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('document_id').notNull(),
    documentCreatedAt: timestamp('document_created_at').notNull().defaultNow(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    customerId: integer("customer_id").references(() => customer.id),
    employeeId: integer("employee_id").references(() => employee.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.id] }),
    foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  ],
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const complaintCategory = pgTable('complaint_category',
  {
    id: integer('id').primaryKey().notNull().generatedByDefaultAsIdentity(),
    name: varchar('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
);

export type ComplaintCategory = InferSelectModel<typeof complaintCategory>;

export const complaintSubCategory = pgTable('complaint_sub_category',
  {
    id: integer('id').primaryKey().notNull().generatedByDefaultAsIdentity(),
    name: varchar('name').notNull(),
    categoryId: integer('category_id').notNull().references(() => complaintCategory.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
);

export type ComplaintSubCategory = InferSelectModel<typeof complaintSubCategory>;

export const complaint = pgTable('complaint',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    referenceNumber: text('reference_number'),
    chatId: uuid('chat_id').notNull().references(() => chat.id),
    customerId: integer('customer_id').references(() => customer.id),
    category: varchar('category'),
    subCategory: varchar('sub_category'),
    description: text('description'),
    additionalDetails: text('additional_details'),
    attachmentUrls: text('attachment_urls'),
    desiredResolution: text('desired_resolution'),
    sentiment: varchar('sentiment'),
    urgencyLevel: varchar('urgency_level'),
    assistantNotes: text('assistant_notes'),
    assignedTo: integer('assigned_to').references(() => employee.id),
    isDraft: boolean('is_draft').notNull().default(true),
    status: varchar('status', { enum: ['open', 'assigned', 'in_progress', 'closed', 'escalated'] }),
    resolutionNotes: text('resolution_notes'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
);

export type Complaint = InferSelectModel<typeof complaint>;

export const complaintComment = pgTable('complaint_comment',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    complaintId: uuid('complaint_id').notNull().references(() => complaint.id),
    employeeId: integer('employee_id').references(() => employee.id),
    comment: text('comment').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
);

export type ComplaintComment = InferSelectModel<typeof complaintComment>;