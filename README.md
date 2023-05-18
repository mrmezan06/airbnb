## Prisma Command Line Interface

### Installation

```sh
npm install -D prisma
```

### Initialize Prisma

```sh
npx prisma init
```

### Creating Schema

```js
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema
// It will connect the .env file DATABASE_URL with the Prisma Client
// File Name: schema.prisma


generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  name String?
  email String? @unique
  emailVerified DateTime?
  image String?
  hashedPassword String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  favoriteIds String[] @db.ObjectId

  accounts Account[]
  listings Listing[]
  reservations Reservation[]
}

model Account {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  provider String
  type String
  providerAccountId String
  refreshToken String? @db.String
  access_token String? @db.String
  expires_at Int?
  token_type String?
  scope String?
  id_token String? @db.String
  session_state String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Listing {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  title String
  description String
  imageSrc String
  createdAt DateTime @default(now())
  category String
  roomCount Int
  bathroomCount Int
  guestCount Int
  locationValue String
  price Int

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  reservations Reservation[]
}

model Reservation {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  listingId String @db.ObjectId
  startDate DateTime
  endDate DateTime
  totalPrice Int
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
}
```

### Generate Collect From Schema

```sh
npx prisma db push
```

### Connect @next-auth/prisma-adapter

[Next Auth Prisma Adapter Documentation](https://authjs.dev/reference/adapter/prisma)

```sh
npm install next-auth @prisma/client @next-auth/prisma-adapter
npm install prisma --save-dev
```

### Setup

Add this adapter to your pages/api/[...nextauth].js next-auth configuration object:

```js
// Filename: pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
```

### Create the Prisma schema from scratch

You need to use at least Prisma 2.26.0. Create a schema file in prisma/schema.prisma similar to this one:

`This schema is adapted for use in Prisma and based upon our main schema`

```js
// Filename: prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Only needed when using a cloud provider that doesn't support the creation of new databases, like Heroku. Learn more: https://pris.ly/d/migrate-shadow
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["referentialActions"] // You won't need this in Prisma 3.X or higher.
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Create the Prisma schema with prisma migrate

This will create an SQL migration file and execute it:

```sh
npx prisma migrate dev
```

Note that you will need to specify your database connection string in the environment variable DATABASE_URL. You can do this by setting it in a .env file at the root of your project.

### Generating the Prisma Client

Once you have saved your schema, use the Prisma CLI to generate the Prisma Client:

```sh
npx prisma generate
```

To configure your database to use the new schema (i.e. create tables and columns) use the prisma migrate command:

```sh
npx prisma migrate dev
```

### MongoDB support

Prisma supports MongoDB, and so does Auth.js. Following the instructions of the [Prisma documentation](https://www.prisma.io/docs/concepts/database-connectors/mongodb) on the MongoDB connector, things you have to change are:

1. Make sure that the id fields are mapped correctly

```js
id  String  @id @default(auto()) @map("_id") @db.ObjectId
```

2. The Native database type attribute to @db.String from @db.Text and userId to @db.ObjectId.

```js
user_id            String   @db.ObjectId
refresh_token      String?  @db.String
access_token       String?  @db.String
id_token           String?  @db.String
```

Everything else should be the same.

### Naming Conventions

If mixed snake_case and camelCase column names is an issue for you and/or your underlying database system, we recommend using Prisma's @map()([see the documentation here](https://www.prisma.io/docs/concepts/components/prisma-schema/names-in-underlying-database)) feature to change the field names. This won't affect Auth.js, but will allow you to customize the column names to whichever naming convention you wish.

For example, moving to snake_case and plural table names.

```js
// Filename: prisma/schema.prisma
model Account {
  id                 String  @id @default(cuid())
  userId             String  @map("user_id")
  type               String
  provider           String
  providerAccountId  String  @map("provider_account_id")
  refresh_token      String? @db.Text
  access_token       String? @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String? @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  accounts      Account[]
  sessions      Session[]

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}
```
