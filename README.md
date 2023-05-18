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
