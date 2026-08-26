export type ProjectMediaType = "image" | "video";

export type ProjectMedia = {
  id: string;
  projectId: string;
  mediaType: ProjectMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  displayOrder: number;
  createdAt?: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  location: string;
  projectType: string;
  railingType: string;
  description: string;
  coverImage: string;
  featured: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  media: ProjectMedia[];
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-01",
    slug: "bhaisepati-railing",
    title: "Bhaisepati Railing",
    location: "Bhaisepati",
    projectType: "Residential",
    railingType: "Balcony & Staircase Railing",
    description:
      "Precision architectural metalwork railing installation executed for a private modern residence in Bhaisepati. Featuring clean geometric lines, concealed mounting, and matte charcoal protective coating.",
    coverImage: "/images/railings/r01.jpg",
    featured: true,
    displayOrder: 1,
    isActive: true,
    media: [
      {
        id: "pm-01-v",
        projectId: "proj-01",
        mediaType: "video",
        mediaUrl: "/videos/railings/bhaisepati-railing.mp4",
        thumbnailUrl: "/images/railings/r01.jpg",
        caption: "Bhaisepati Railing 4K Walkthrough",
        displayOrder: 0,
      },
      {
        id: "pm-01-1",
        projectId: "proj-01",
        mediaType: "image",
        mediaUrl: "/images/railings/r01.jpg",
        thumbnailUrl: "/images/railings/r01.jpg",
        caption: "Terrace Balcony Installation Overview",
        displayOrder: 1,
      },
      {
        id: "pm-01-2",
        projectId: "proj-01",
        mediaType: "image",
        mediaUrl: "/images/railings/r07.jpg",
        thumbnailUrl: "/images/railings/r07.jpg",
        caption: "Corner Joinery & Handrail Detail",
        displayOrder: 2,
      },
      {
        id: "pm-01-3",
        projectId: "proj-01",
        mediaType: "image",
        mediaUrl: "/images/railings/r08.jpg",
        thumbnailUrl: "/images/railings/r08.jpg",
        caption: "Side Profile & Architectural Framing",
        displayOrder: 3,
      },
    ],
  },
  {
    id: "proj-02",
    slug: "budhanilkantha-railing",
    title: "Budhanilkantha Railing",
    location: "Budhanilkantha",
    projectType: "Residential",
    railingType: "Balcony Railing",
    description:
      "Custom-engineered balcony railing system with minimalist vertical bars and weather-resistant architectural bronze finish overlooking the Kathmandu valley.",
    coverImage: "/images/railings/r02.jpg",
    featured: false,
    displayOrder: 2,
    isActive: true,
    media: [
      {
        id: "pm-02-v",
        projectId: "proj-02",
        mediaType: "video",
        mediaUrl: "/videos/railings/budhanilkantha-railing.mp4",
        thumbnailUrl: "/images/railings/r02.jpg",
        caption: "Budhanilkantha Railing Installation Video",
        displayOrder: 0,
      },
      {
        id: "pm-02-1",
        projectId: "proj-02",
        mediaType: "image",
        mediaUrl: "/images/railings/r02.jpg",
        thumbnailUrl: "/images/railings/r02.jpg",
        caption: "Balcony Railing Elevation",
        displayOrder: 1,
      },
      {
        id: "pm-02-2",
        projectId: "proj-02",
        mediaType: "image",
        mediaUrl: "/images/railings/r09.jpg",
        thumbnailUrl: "/images/railings/r09.jpg",
        caption: "Post Base Anchor Detail",
        displayOrder: 2,
      },
    ],
  },
  {
    id: "proj-03",
    slug: "naxal-railing",
    title: "Naxal Railing",
    location: "Naxal",
    projectType: "Commercial / Residential",
    railingType: "Balcony & Glass Railing",
    description:
      "Contemporary architectural metalwork and tempered glass railing system fabricated for a high-traffic urban project in Naxal.",
    coverImage: "/images/railings/r03.jpg",
    featured: false,
    displayOrder: 3,
    isActive: true,
    media: [
      {
        id: "pm-03-v",
        projectId: "proj-03",
        mediaType: "video",
        mediaUrl: "/videos/railings/naxal-railing.mp4",
        thumbnailUrl: "/images/railings/r03.jpg",
        caption: "Naxal 4K Installation Video",
        displayOrder: 0,
      },
      {
        id: "pm-03-1",
        projectId: "proj-03",
        mediaType: "image",
        mediaUrl: "/images/railings/r03.jpg",
        thumbnailUrl: "/images/railings/r03.jpg",
        caption: "Facade Railing Architecture",
        displayOrder: 1,
      },
      {
        id: "pm-03-2",
        projectId: "proj-03",
        mediaType: "image",
        mediaUrl: "/images/railings/r10.jpg",
        thumbnailUrl: "/images/railings/r10.jpg",
        caption: "Metal Framing with Glass Integration",
        displayOrder: 2,
      },
    ],
  },
  {
    id: "proj-04",
    slug: "dhapasi-railing",
    title: "Dhapasi Railing",
    location: "Dhapasi",
    projectType: "Residential",
    railingType: "Staircase Railing",
    description:
      "Precision continuous handrail and geometric balustrade detailing manufactured for a multi-story modern residence in Dhapasi.",
    coverImage: "/images/railings/r04.jpg",
    featured: false,
    displayOrder: 4,
    isActive: true,
    media: [
      {
        id: "pm-04-v",
        projectId: "proj-04",
        mediaType: "video",
        mediaUrl: "/videos/railings/dhapasi-railing.mp4",
        thumbnailUrl: "/images/railings/r04.jpg",
        caption: "Dhapasi Staircase Railing Video",
        displayOrder: 0,
      },
      {
        id: "pm-04-1",
        projectId: "proj-04",
        mediaType: "image",
        mediaUrl: "/images/railings/r04.jpg",
        thumbnailUrl: "/images/railings/r04.jpg",
        caption: "Staircase Balustrade Running Length",
        displayOrder: 1,
      },
      {
        id: "pm-04-2",
        projectId: "proj-04",
        mediaType: "image",
        mediaUrl: "/images/railings/r11.jpg",
        thumbnailUrl: "/images/railings/r11.jpg",
        caption: "Stair Landing Handrail Return",
        displayOrder: 2,
      },
    ],
  },
  {
    id: "proj-05",
    slug: "imadole-railing",
    title: "Imadole Railing",
    location: "Imadole",
    projectType: "Residential",
    railingType: "Boundary & Balcony Railing",
    description:
      "Complete residential boundary and terrace railing installation crafted with laser-cut detailing and structural steel anchor points.",
    coverImage: "/images/railings/r05.jpg",
    featured: false,
    displayOrder: 5,
    isActive: true,
    media: [
      {
        id: "pm-05-v",
        projectId: "proj-05",
        mediaType: "video",
        mediaUrl: "/videos/railings/imadole-railing.mp4",
        thumbnailUrl: "/images/railings/r05.jpg",
        caption: "Imadole Installation Video",
        displayOrder: 0,
      },
      {
        id: "pm-05-1",
        projectId: "proj-05",
        mediaType: "image",
        mediaUrl: "/images/railings/r05.jpg",
        thumbnailUrl: "/images/railings/r05.jpg",
        caption: "Boundary Railing Perimeter",
        displayOrder: 1,
      },
      {
        id: "pm-05-2",
        projectId: "proj-05",
        mediaType: "image",
        mediaUrl: "/images/railings/r12.jpg",
        thumbnailUrl: "/images/railings/r12.jpg",
        caption: "Gate & Balcony Alignment Detail",
        displayOrder: 2,
      },
    ],
  },
  {
    id: "proj-06",
    slug: "skylight-time",
    title: "Skylight Time",
    location: "",
    projectType: "Architectural Metalwork",
    railingType: "Custom Metalwork & Skylight Structure",
    description:
      "Bespoke structural steel fabrication and architectural metalwork designed to frame natural light in a contemporary architectural setting.",
    coverImage: "/images/railings/r06.jpg",
    featured: false,
    displayOrder: 6,
    isActive: true,
    media: [
      {
        id: "pm-06-v",
        projectId: "proj-06",
        mediaType: "video",
        mediaUrl: "/videos/railings/skylight-time.mp4",
        thumbnailUrl: "/images/railings/r06.jpg",
        caption: "Skylight Structural Steel Video",
        displayOrder: 0,
      },
      {
        id: "pm-06-1",
        projectId: "proj-06",
        mediaType: "image",
        mediaUrl: "/images/railings/r06.jpg",
        thumbnailUrl: "/images/railings/r06.jpg",
        caption: "Skylight Structural Steel Framing",
        displayOrder: 1,
      },
      {
        id: "pm-06-2",
        projectId: "proj-06",
        mediaType: "image",
        mediaUrl: "/images/railings/r13.jpg",
        thumbnailUrl: "/images/railings/r13.jpg",
        caption: "Precision Welded Light Frame",
        displayOrder: 2,
      },
    ],
  },
];
