import { pgTable, text, serial, integer, boolean, timestamp, unique, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User model (from existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Database Connections
export const dbConnections = pgTable("db_connections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: text("port").notNull(),
  database: text("database").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  secure: boolean("secure").default(true),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConnectionSchema = createInsertSchema(dbConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DbConnection = typeof dbConnections.$inferSelect;
export type InsertDbConnection = z.infer<typeof insertConnectionSchema>;

// Database Tables Metadata
export const dbTables = pgTable("db_tables", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").notNull().references(() => dbConnections.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  schema: text("schema").default("public"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniqueTablePerConnection: unique().on(table.connectionId, table.name, table.schema),
  }
});

export const dbTablesRelations = relations(dbTables, ({ one, many }) => ({
  connection: one(dbConnections, {
    fields: [dbTables.connectionId],
    references: [dbConnections.id],
  }),
  columns: many(dbColumns)
}));

export const insertTableSchema = createInsertSchema(dbTables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DbTable = typeof dbTables.$inferSelect;
export type InsertDbTable = z.infer<typeof insertTableSchema>;

// Database Columns Metadata
export const dbColumns = pgTable("db_columns", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull().references(() => dbTables.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  nullable: boolean("nullable").default(true),
  isPrimary: boolean("is_primary").default(false),
  isUnique: boolean("is_unique").default(false),
  defaultValue: text("default_value"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniqueColumnPerTable: unique().on(table.tableId, table.name),
  }
});

export const dbColumnsRelations = relations(dbColumns, ({ one }) => ({
  table: one(dbTables, {
    fields: [dbColumns.tableId],
    references: [dbTables.id],
  }),
}));

export const insertColumnSchema = createInsertSchema(dbColumns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DbColumn = typeof dbColumns.$inferSelect;
export type InsertDbColumn = z.infer<typeof insertColumnSchema>;

// Activity Log
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").notNull().references(() => dbConnections.id, { onDelete: "cascade" }),
  tableId: integer("table_id").references(() => dbTables.id, { onDelete: "set null" }),
  operation: text("operation").notNull(), // INSERT, UPDATE, DELETE, SELECT
  details: text("details"),
  status: text("status").notNull(), // SUCCESS, ERROR
  userId: integer("user_id").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// App Settings
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAppSettingSchema = createInsertSchema(appSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = z.infer<typeof insertAppSettingSchema>;
