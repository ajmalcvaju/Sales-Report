import multer from "multer";
import nodemailer from "nodemailer";



const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
export const uploads = upload.fields([
  { name: "pdf" },
  { name: "excel" }
]);
