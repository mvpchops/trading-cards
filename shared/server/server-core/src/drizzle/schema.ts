
import {
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		nickname: varchar("nickname", { length: 25 }).notNull(),
		password: varchar("password", { length: 75 }).notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => {
		return {
			nicknameIndex: uniqueIndex("nicknameIndex").on(table.nickname),
		};
	},
);

export const favorites = pgTable("favorites", {
	id: uuid("id").primaryKey().defaultRandom(),
	cardId: varchar("card_id", { length: 75 }).notNull(),
	userId: uuid("user_id").references(() => users.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
}, (table) => {
	return {
		userAndCardIdIndex: uniqueIndex("user_card_id_index").on(table.cardId, table.userId)
	};
});
