const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config(); // Load environment variables
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Departments, Employees, Units, Forms } = require("./models/model");
// const API_URL = process.env.REACT_APP_FRONTEND_API_URL;

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For form-urlencoded payloads

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// PUT route
// app.put("/forms/:id/status", async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   try {
//     // Process the status update for the form with ID
//     const updatedForm = await Forms.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );
//     if (!updatedForm) {
//       return res.status(404).json({ message: "Form not found" });
//     }
//     res.status(200).json(updatedForm);
//   } catch (error) {
//     console.error("Error updating status:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
app.delete("/api/forms/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedForm = await Forms.findByIdAndDelete(id);
    if (!deletedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/forms/counts", async (req, res) => {
  try {
    console.log("🔵 Fetching form counts...");

    // Case-insensitive query to avoid mismatches
    const approvedCount = await Forms.countDocuments({ status: /approved/i });
    const rejectedCount = await Forms.countDocuments({ status: /rejected/i });
    const modifiedCount = await Forms.countDocuments({ status: /modified/i });

    console.log("✅ Counts:", { approvedCount, rejectedCount, modifiedCount });

    res.status(200).json({
      approved: approvedCount,
      rejected: rejectedCount,
      modified: modifiedCount,
    });
  } catch (error) {
    console.error("❌ Error fetching form counts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post("/api/forms/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, data, modification } = req.body; // ✅ Fix: Using correct field name
  console.log("🟢 Received request to update status");
  console.log("🔹 Form ID:", id);
  console.log("🔹 New Status:", status);
  console.log("🔹 Modification:", modification);

  try {
    const form_data = await Forms.findById(id);
    if (!form_data) {
      console.log("❌ Form not found!");
      return res.status(404).json({ message: "Form not found" });
    }

    console.log(form_data);

    if (!form_data.fromcardno) {
      return res.status(404).json({ message: "From card no not found" });
    }

    console.log(form_data.fromcardno);

    const employee = await Employees.findOne({
      CardNo: Number(form_data.fromcardno),
    });

    if (!employee) {
      console.log("❌ Employee not found!");
      return res.status(400).json({ message: "Employee not found" });
    }
    // ✅ Prepare update object
    let updateData = { status };
    if (status === "Modified" && modification) {
      updateData.modification = modification;
    }

    console.log("🔹 Update Data:", updateData);

    // 4️⃣ Update the form in MongoDB (✅ Fixed syntax)
    const updatedForm = await Forms.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    if (!updatedForm) {
      console.log("❌ Update failed! Check if ID exists:", id);
      return res.status(500).json({ message: "Failed to update form" });
    }
    console.log("🔹 Updated Form Data:", updatedForm);
    // Send email to the employee
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Process the status update for the form with ID
    if (status === "Approved") {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: "Form Approval",
        text: "Your form has been approved",
      };
      console.log("Sending Email", mailOptions);

      await transporter.sendMail(mailOptions);
    } else if (status === "Rejected") {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: "Form Rejection",
        text: "Your form has been rejected",
      };
      console.log("Sending Email", mailOptions);

      await transporter.sendMail(mailOptions);
    } else if (status === "Modified") {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: "Form Modification Needed",
        text: "Your form need some modifications:- " + data,
      };
      console.log("Sending Email", mailOptions);

      await transporter.sendMail(mailOptions);
    }
    return res.status(200).json({
      message: "Status updated successfully",
      updatedForm: updatedForm,
    });
  } catch (error) {
    console.error("Error updating status:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Routes
app.get("/api/forms", async (req, res) => {
  try {
    const { serialNumber, dept, dateFrom, dateTo } = req.query;
    const query = {};

    console.log("Received search query:", {
      serialNumber,
      dept,
      dateFrom,
      dateTo,
    });

    // ✅ Filter by Serial Number if provided
    if (serialNumber) {
      query.serialNumber = Number(serialNumber); // Ensure it's a number
    }

    // ✅ Filter by department if provided
    if (dept) {
      query.dept = dept;
    }

    // ✅ Filter by date range if provided
    if (dateFrom && dateTo) {
      query.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)),
      };
    }

    // Fetch forms based on filters
    const forms = await Forms.find(query).lean();

    if (forms.length === 0) {
      return res.status(404).json({ message: "No forms found" });
    }

    // ✅ Attach full file URL if available
    const hostUrl = `${req.protocol}://${req.get("host")}`;
    const updatedForms = forms.map((form) => ({
      ...form,
      uploadedFile: form.uploadedFile
        ? `${hostUrl}/${form.uploadedFile}`
        : null,
    }));

    res.json(updatedForms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

//Get forms based on status
app.get("/api/forms/status/:status", async (req, res) => {
  try {
    const { status } = req.params;
    console.log("🔵 Received status:", status);

    const forms = await Forms.find({
      status: status,
    });
    console.log("✅ Found forms:", forms);

    if (forms.length === 0) {
      console.log("⚠️ No forms found for this status.");
      return res.status(404).json({ message: "No forms found." });
    }

    res.status(200).json(forms);
  } catch (error) {
    console.error("❌ Error fetching forms by status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/departments", async (req, res) => {
  try {
    const departments = await Departments.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments" });
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employees.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees" });
  }
});

app.get("/api/employees/:cardno", async (req, res) => {
  const { cardno } = req.params;
  try {
    const employee = await Employees.findOne({ cardno });
    if (!employee) {
      return res.status(404).send({ message: "Employee not found" });
    }
    res.status(200).send(employee);
  } catch (error) {
    res.status(500).send({ message: "Error fetching employee" });
  }
});

app.get("/api/units", async (req, res) => {
  try {
    const units = await Units.find();
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ message: "Error fetching units" });
  }
});

app.get("/api/approval-authorities", async (req, res) => {
  try {
    const employees = await Employees.find({ manager: { $exists: true } });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching approval authorities" });
  }
});


app.post("/api/send-email", async (req, res) => {
  try {
    const { email, subject, body, attachments } = req.body;

    const mailOptions = {
      to: email,
      subject,
      text: body,
      ...(attachments && { attachments }),
    };

    await sendMail(
      mailOptions.to,
      mailOptions.subject,
      mailOptions.text,
      mailOptions.attachments
    );

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

app.post("/api/form/submit", upload.single("file"), async (req, res) => {
  const {
    from,
    dept,
    fromcardno,
    for: forField,
    purpose,
    unit,
    approvalNeededFrom,
  } = req.body;
  try {
    // Find the selected employee's email
    const selectedEmployee = await Employees.findById(approvalNeededFrom);
    if (!selectedEmployee || !selectedEmployee.email) {
      return res
        .status(400)
        .json({ message: "Invalid employee selected or email not found" });
    }

    // Handle uploaded file
    const uploadedFile = req.file
      ? {
          path: req.file.path,
          originalname: req.file.originalname,
        }
      : null;

    // Save form data to the database
    const form = new Forms({
      from,
      dept,
      fromcardno,
      for: forField,
      purpose,
      unit,
      approvalNeededFrom,
      uploadedFile: uploadedFile ? uploadedFile.path : null,
    });

    await form.save();

    // Send email notification with the form details
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const templateListURL = process.env.REACT_APP_FRONTEND_URL
      ? `${process.env.REACT_APP_FRONTEND_URL}/templatelist`
      : "http://localhost:3000/templatelist"; // Fallback for testing

    console.log("Generated Link:", templateListURL); // Debugging line

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: selectedEmployee.email,
      subject: "Template Approval",
      html: `
    <p>Kindly check and approve the below template via the link:</p>
    <p><a href="${templateListURL}" target="_blank">${templateListURL}</a></p>
    <p><strong>From:</strong> ${from}</p>
    <p><strong>Department:</strong> ${dept?.name || dept}</p>
    <p><strong>For:</strong> ${forField}</p>
    <p><strong>Purpose:</strong> ${purpose}</p>
    <p><strong>Unit:</strong> ${unit}</p>
    <p><strong>From Card No:</strong> ${fromcardno}</p>
`,
      ...(uploadedFile && {
        attachments: [
          {
            filename: uploadedFile.originalname,
            path: uploadedFile.path,
          },
        ],
      }),
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error submitting form or sending email" });
  }
});

// Example route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const formRoutes = require("./routes/FormRoutes");
app.use("/api/form", formRoutes);

// Set the port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
