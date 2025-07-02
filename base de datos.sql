CREATE TABLE roles (
    RoleId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255)
);

CREATE TABLE claims (
    ClaimId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    RoleId INT,
    FOREIGN KEY (RoleId) REFERENCES roles(RoleId)
);

CREATE TABLE person (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(255),
    LastName VARCHAR(255),
    HouseNumber INT,
    Residents INT,
    Phone BIGINT
);

CREATE TABLE user (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(250),
    Password VARCHAR(255),
    RoleId VARCHAR(250), -- NOTA: Este campo debería ser INT si se relaciona con roles.RoleId
    UserName VARCHAR(250),
    Debtor VARCHAR(255),
    FOREIGN KEY (UserId) REFERENCES person(UserId)
);

CREATE TABLE incomes (
    IncomeId INT AUTO_INCREMENT PRIMARY KEY,
    Description VARCHAR(255),
    Amount INT,
    UserId INT,
    Date DATE,
    Status VARCHAR(255),
    RegisteredBy INT,
    Concept VARCHAR(255),
    ApprovedBy VARCHAR(255),
    FOREIGN KEY (UserId) REFERENCES person(UserId)
);

CREATE TABLE bills (
    billId INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255),
    Amount INT,
    UserId INT,
    Date DATE,
    Status VARCHAR(255),
    RegisteredBy VARCHAR(255),
    ApprovedBy VARCHAR(255),
    FOREIGN KEY (UserId) REFERENCES person(UserId)
);

CREATE TABLE balance (
    RecordId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT,
    Amount INT,
    Description VARCHAR(255),
    Concept VARCHAR(255),
    Notes VARCHAR(255),
    Status VARCHAR(255),
    CreatedOn DATE,
    LastModification DATE,
    FOREIGN KEY (UserId) REFERENCES person(UserId)
);

CREATE TABLE notifications (
    NotificationId INT AUTO_INCREMENT PRIMARY KEY,
    Description VARCHAR(255),
    UserId INT,
    Date DATE,
    Status VARCHAR(255),
    FOREIGN KEY (UserId) REFERENCES person(UserId)
);

CREATE TABLE comments (
    RecordId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT,
    Title VARCHAR(255),
    Message VARCHAR(255),
    CreatedOn DATE,
    FOREIGN KEY (UserId) REFERENCES person(UserId)
);

CREATE TABLE visits (
    VisitorId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    UserId INT,
    Date DATE,
    Status VARCHAR(255),
    Vehicle VARCHAR(255),
    NumberOfVisitors INT,
    RegisteredBy VARCHAR(255),
    FOREIGN KEY (UserId) REFERENCES person(UserId)
);

CREATE TABLE deletedhistory (
    RecordId INT AUTO_INCREMENT PRIMARY KEY,
    Description VARCHAR(255),
    Module VARCHAR(255),
    DeletedBy VARCHAR(255),
    CreatedBy VARCHAR(255),
    CreatedOn DATE,
    DeletedOn DATE,
    Notes VARCHAR(255)
);

CREATE TABLE fines (
    FineId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255),
    Amount INT
);
