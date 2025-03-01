import { defineCollection } from 'astro:content';
import { notionLoader } from "notion-astro-loader";

const postCollection = defineCollection({
  loader: notionLoader(
    {
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_BLOG_DATABASE_ID,
  }),
});


const eventsCollection = defineCollection({
  loader: notionLoader(
    {
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_EVENTS_DATABASE_ID,
  }),
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

export const collections = {
  post: postCollection,
  resources: resourcesCollection,
  events: eventsCollection,
  faq: faqCollection
};
