import mongoose from "mongoose";
import bcrypt from "bcrypt";

const MemberSchema = new mongoose.Schema({
  // Personal Info
  name: String, 
  fatherName: String,
  grandfatherName: String,
  nameAmharic: String,
  fatherNameAmharic: String,
  grandfatherNameAmharic: String,
  sex: String,
  age: Number,
  idNumber: {
  type: String,
  required: true,
  unique: true,
  index: true
},
  phoneNumber: String,
  email: { type: String, unique: true, sparse: true },

  // Church info
  salvationDate: Date,
  baptismDateEC: String,
  baptizedBy: String,
  salvationPlace: String,

  // Status
  isActive: Boolean,
  isAlive: Boolean,
  country: String,

  // Children, Education, Work, etc.
  childrenList: [{ name: String, age: Number }],
  educationStatus: String,
  educationLevel: String,
  employmentStatus: String,
  organization: String,
  skills: String,
  completedCourses: { type: [String], required: true },
  serviceArea: String,
  serviceExplanation: String,
  testimony: String,

  // Profile
  profilePic: String,

  // Authentication (new)
  username: { type: String, unique: true, sparse: true },
  password: String,
  role: { type: String, enum: ["member", "admin"], default: "member" },

  resetCode: String,
  resetCodeExpires: Date,

  refreshToken: {
  type: String
  }

}, { timestamps: true });

// Hash password before save
MemberSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    next(err);
  }
});

// Compare password method
MemberSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Member = mongoose.model("Member", MemberSchema);
export default Member;
