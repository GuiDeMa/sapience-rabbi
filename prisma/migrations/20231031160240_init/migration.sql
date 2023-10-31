-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "paymail" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "inReplyTo" TEXT NOT NULL,
    "paymail" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    CONSTRAINT "Post_paymail_fkey" FOREIGN KEY ("paymail") REFERENCES "User" ("paymail") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "inReplyTo" TEXT NOT NULL,
    "paymail" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    CONSTRAINT "Message_paymail_fkey" FOREIGN KEY ("paymail") REFERENCES "User" ("paymail") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txid" TEXT NOT NULL,
    "satoshis" BIGINT NOT NULL,
    "blockHeight" INTEGER NOT NULL,
    "postByTxid" TEXT,
    "messageByTxid" TEXT,
    "userByAddress" TEXT NOT NULL,
    CONSTRAINT "Lock_postByTxid_fkey" FOREIGN KEY ("postByTxid") REFERENCES "Post" ("txid") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lock_messageByTxid_fkey" FOREIGN KEY ("messageByTxid") REFERENCES "Message" ("txid") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lock_userByAddress_fkey" FOREIGN KEY ("userByAddress") REFERENCES "User" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "User_paymail_key" ON "User"("paymail");

-- CreateIndex
CREATE UNIQUE INDEX "Post_txid_key" ON "Post"("txid");

-- CreateIndex
CREATE UNIQUE INDEX "Message_txid_key" ON "Message"("txid");

-- CreateIndex
CREATE UNIQUE INDEX "Lock_txid_key" ON "Lock"("txid");
