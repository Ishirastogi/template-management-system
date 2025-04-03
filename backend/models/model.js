const mongoose = require("mongoose");

const DepartmentsSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const EmployeesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String },
  manager: { type: Boolean, default: false },
  CardNo: { type: Number, required: true },
});

const UnitsSchema = new mongoose.Schema({
  unit: { type: String, required: true },
});

const FromCardSchema = new mongoose.Schema({
  fromcardno: { type: String, required: true },
});

const FormSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    dept: { type: String, required: true },
    fromcardno: { type: String, required: true },
    for: { type: String, required: true },
    purpose: { type: String, required: true },
    unit: { type: String, required: true },
    approvalNeededFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
    },
    uploadedFile: { type: String }, // Optional file upload
    serialNumber: { type: Number, unique: true }, // Unique Serial Number
    // status: { type: String, default: null }
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Modified"], // ✅ Restricts status values
      default: "Pending",
    },
    modification: {
      type: String,
      default: "", // ✅ Ensures 'modification' exists, defaults to an empty string
    },
  },
  { timestamps: true }
);

// ✅ Generate sequential serial number before saving
FormSchema.pre("save", async function (next) {
  if (!this.serialNumber) {
    try {
      const count = await mongoose.model("Forms").countDocuments();
      this.serialNumber = count + 1; // Always assigns the next number
      console.log("Generated Serial Number:", this.serialNumber);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Departments = mongoose.model("Departments", DepartmentsSchema);
const Employees = mongoose.model("Employees", EmployeesSchema);
const Units = mongoose.model("Units", UnitsSchema);
const Forms = mongoose.model("Forms", FormSchema);
const FromCardno = mongoose.model("FromCardno", FromCardSchema);

module.exports = { Departments, Employees, Units, Forms, FromCardno };
