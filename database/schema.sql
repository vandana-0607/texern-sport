/*
  Run this script in SQL Server Management Studio (SSMS).
  It creates a learning database and the first table for contact enquiries.
*/
IF DB_ID(N'SportSphereDB') IS NULL
    CREATE DATABASE SportSphereDB;
GO

USE SportSphereDB;
GO

IF OBJECT_ID(N'dbo.ContactEnquiries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContactEnquiries
    (
        EnquiryId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ContactEnquiries PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Email NVARCHAR(254) NOT NULL,
        Subject NVARCHAR(150) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        Status NVARCHAR(20) NOT NULL CONSTRAINT DF_ContactEnquiries_Status DEFAULT N'New',
        CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ContactEnquiries_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_ContactEnquiries_Status CHECK (Status IN (N'New', N'InProgress', N'Resolved'))
    );
END;
GO

-- Verify that the table exists:
SELECT TOP (20) EnquiryId, Name, Email, Subject, Status, CreatedAt
FROM dbo.ContactEnquiries
ORDER BY EnquiryId DESC;
GO
