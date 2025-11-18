
export const SITE_SECTIONS = [
  {
    title: "MOR",
    sites: [
      "OR1", "OR2", "OR3", "OR4", "OR5", "OR6", "OR7", "OR8", "OR9", "OR10",
      "OR11", "OR12", "OR14", "OR15", "OR16", "OR17", "OR18", "OR19", "OR21", "OR23"
    ]
  },
  {
    title: "Endoscopy",
    sites: ["ENDO1", "ENDO2", "ENDO3"]
  },
  {
    title: "Radiology",
    sites: ["MRI", "TEE/DH", "IR1", "IR2"]
  },
  {
    title: "Heart Institute",
    sites: ["CV1", "CV2", "CV3", "CV9", "EP4", "EP5", "EP10", "CCL6"]
  },
  {
    title: "Same Day Surgery",
    sites: ["SDS1", "SDS2", "SDS3", "SDS4", "SDS5", "SDS6"]
  },
  {
    title: "Women's Hospital",
    sites: ["WH1", "WH2", "WH3", "WH4", "WH5", "WH6", "WH7", "WH8", "WH9", "WH10"]
  }
];

export const OR_SITES = SITE_SECTIONS.flatMap(section => section.sites);

export const COLUMNS = ["Anesthesiologist", "AHP", "Relief"];

export const PHONE_NUMBERS: Record<string, string> = {
  "Dr. Smith": "+15551234567",
  "Dr. Jones": "+15559876543",
  "Jane Doe": "+15553456789"
};

export const ItemTypes = {
  STAFF: 'staff',
};
