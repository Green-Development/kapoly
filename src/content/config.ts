import { defineCollection } from 'astro:content';
import { notionLoader } from "notion-astro-loader";
import { eventsCollectionSchema } from "~/content/eventsCollectionSchema.ts";

const postCollection = defineCollection({
  loader: notionLoader(
    {
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_BLOG_DATABASE_ID,
  }),
});


const eventsCollection = defineCollection({
  loader: async () => {
    const response = await fetch("https://queerka.de/api/events/within?startDateTime=2000-01-01&endDateTime=2125-12-31&orgId=5c1ee6d920413277b70a7263");
    return response.json();
  },
  schema: eventsCollectionSchema,
});

const resourcesCollection = defineCollection({
  loader: notionLoader(
    {
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_RESSOURCES_DATABASE_ID,
  }),
});

const faqCollection = defineCollection({
  loader: notionLoader(
    {
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_FAQ_DATABASE_ID,
  }),
});

const orgaCollection = defineCollection({
  loader: notionLoader(
    {
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_ORGA_DATABASE_ID,
  }),
});

export const collections = {
  post: postCollection,
  resources: resourcesCollection,
  events: eventsCollection,
  faq: faqCollection,
  orga: orgaCollection
};
