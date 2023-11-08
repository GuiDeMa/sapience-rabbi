-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "block" INTEGER
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "txid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "inReplyTo" TEXT,
    "postedByUserAddress" TEXT,
    "app" TEXT NOT NULL,
    CONSTRAINT "Post_txid_fkey" FOREIGN KEY ("txid") REFERENCES "Transaction" ("hash") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Post_postedByUserAddress_fkey" FOREIGN KEY ("postedByUserAddress") REFERENCES "User" ("address") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "txid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "inReplyTo" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "sentByUserAddress" TEXT,
    CONSTRAINT "Message_txid_fkey" FOREIGN KEY ("txid") REFERENCES "Transaction" ("hash") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_sentByUserAddress_fkey" FOREIGN KEY ("sentByUserAddress") REFERENCES "User" ("address") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "txid" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "satoshis" BIGINT NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    "lockTargetByTxid" TEXT,
    "lockerByUserAddress" TEXT,
    CONSTRAINT "Lock_txid_fkey" FOREIGN KEY ("txid") REFERENCES "Transaction" ("hash") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lock_lockTargetByTxid_fkey" FOREIGN KEY ("lockTargetByTxid") REFERENCES "Transaction" ("hash") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lock_lockerByUserAddress_fkey" FOREIGN KEY ("lockerByUserAddress") REFERENCES "User" ("address") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Post_txid_key" ON "Post"("txid");

-- CreateIndex
CREATE UNIQUE INDEX "Message_txid_key" ON "Message"("txid");

-- CreateIndex
CREATE UNIQUE INDEX "Message_channel_key" ON "Message"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "Lock_txid_key" ON "Lock"("txid");