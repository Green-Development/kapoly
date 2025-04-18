import { z } from "zod";

const imageSchema = z.object({
  name: z.string(),
  description: z.string(),
  copyright: z.string(),
});

const hostingOrgSchema = z.object({
  Name: z.string(),
  QueerKAPageName: z.string(),
  Images: z.array(imageSchema),
  id: z.string(),
  imgPrefix: z.string(),
});

export const eventsCollectionSchema = z.object({
  Title: z.string(),
  Description: z.string(),
  Images: z.array(imageSchema),
  Location: z.string(),
  Address: z.string(),
  EntranceFee: z.string(),
  TicketURL: z.string(),
  Recurring: z.boolean(),
  startDateTime: z.string(), // could also be z.coerce.date() if you want to parse
  endDateTime: z.string(),
  email: z.string(),
  URL: z.string(),
  FacebookURL: z.string(),
  dateCreated: z.string(),
  NoEntranceFee: z.boolean(),
  copyrightNoticeAccepted: z.boolean(),
  isWheelchairAccessible: z.boolean(),
  providesSignLanguage: z.boolean(),
  hasQuietZone: z.boolean(),
  id: z.string(),
  hostingOrganizationId: z.string(),
  createdById: z.string(),
  imgPrefix: z.string(),
  hostingOrganization: hostingOrgSchema,
});
