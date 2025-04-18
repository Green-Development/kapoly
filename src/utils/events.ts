import type { PaginateFunction } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Event } from '~/types';
import { formatInTimeZone } from 'date-fns-tz';
import { APP_EVENT_BLOG } from 'astrowind:config';
import {
  cleanSlug,
  trimSlash,
  EVENT_BLOG_BASE,
  EVENT_PERMALINK_PATTERN,
} from './permalinks';
import { getFormattedDate } from "~/utils/utils.ts";

const generateEventPermalink = async ({
  id,
  slug,
  publishDate,
  category,
}: {
  id: string;
  slug: string;
  publishDate: Date;
  category: string | undefined;
}) => {
  const year = String(publishDate.getFullYear()).padStart(4, '0');
  const month = String(publishDate.getMonth() + 1).padStart(2, '0');
  const day = String(publishDate.getDate()).padStart(2, '0');
  const hour = String(publishDate.getHours()).padStart(2, '0');
  const minute = String(publishDate.getMinutes()).padStart(2, '0');
  const second = String(publishDate.getSeconds()).padStart(2, '0');

  const permalink = EVENT_PERMALINK_PATTERN.replace('%slug%', slug)
    .replace('%id%', id)
    .replace('%category%', category || '')
    .replace('%year%', year)
    .replace('%month%', month)
    .replace('%day%', day)
    .replace('%hour%', hour)
    .replace('%minute%', minute)
    .replace('%second%', second);

  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
};

const getNormalizedEvent = async (event: CollectionEntry<'events'>): Promise<Event> => {
  const { id, data } = event;

  const title = data.Title;
  const content = data.Description;
  const date = new Date(data.startDateTime ?? new Date())
  const time = formatInTimeZone(date, 'Europe/Berlin', 'HH:mm') + ' Uhr'
  const location = `${data.Location} (${data.Address})`.trim();
  const image = data.Images.length === 1 && data.Images[0].name !== "polyamory-flag.png"  ? `https://queerka.de/imageupload/eventImages/${data.imgPrefix}${data.Images[0].name}` : '~/assets/images/polyamory-flag.png';
  const alt = data.Images.length === 1 && data.Images[0].name !== "polyamory-flag.png"  ? data.Images[0].description : 'Polyamorie-Flagge mit drei horizontalen Streifen: Blau oben, Rot in der Mitte und Dunkellila unten. Links zeigt ein weißes Chevron-Dreieck nach innen und enthält ein gelbes Herz.';
  const slug = cleanSlug(id);
  const publishDate = new Date(data.dateCreated ?? new Date());

  const permalink = await generateEventPermalink({ id, slug, publishDate, category: undefined })
  const excerpt = `${getFormattedDate(date)} um ${time}, ${location}`
  const metadata = { title, description: excerpt };

  return {
    id,
    slug,
    permalink,
    date,
    time,
    publishDate,

    title,
    excerpt,
    location,
    image,
    alt,
    
    draft: false,
    metadata,

    content,
  };
};


const loadEvents = async function (): Promise<Array<Event>> {
  const events = await getCollection('events');
  const normalizedEvents = events.map(async (event) => await getNormalizedEvent(event));

  const results = (await Promise.all(normalizedEvents))
    .sort((a, b) => b.date.valueOf() - a.date.valueOf())
    .filter((event) => !event.draft);

  return results;
};

let _events: Array<Event>;

/** */
export const isBlogEnabled = APP_EVENT_BLOG.isEnabled;
export const isRelatedPostsEnabled = APP_EVENT_BLOG.isRelatedPostsEnabled;
export const isBlogListRouteEnabled = APP_EVENT_BLOG.list.isEnabled;
export const isBlogPostRouteEnabled = APP_EVENT_BLOG.event.isEnabled;
export const isBlogCategoryRouteEnabled = APP_EVENT_BLOG.category.isEnabled;
export const isBlogTagRouteEnabled = APP_EVENT_BLOG.tag.isEnabled;

export const blogListRobots = APP_EVENT_BLOG.list.robots;
export const blogPostRobots = APP_EVENT_BLOG.event.robots;
export const blogCategoryRobots = APP_EVENT_BLOG.category.robots;
export const blogTagRobots = APP_EVENT_BLOG.tag.robots;

export const blogPostsPerPage = APP_EVENT_BLOG?.postsPerPage;

/** */
export const fetchEvents = async (): Promise<Array<Event>> => {
  if (!_events) {
    _events = await loadEvents();
  }

  return _events;
};

/** */
export const findEventsBySlugs = async (slugs: Array<string>): Promise<Array<Event>> => {
  if (!Array.isArray(slugs)) return [];

  const events = await fetchEvents();

  return slugs.reduce(function (r: Array<Event>, slug: string) {
    events.some(function (event: Event) {
      return slug === event.slug && r.push(event);
    });
    return r;
  }, []);
};

/** */
export const findEventsByIds = async (ids: Array<string>): Promise<Array<Event>> => {
  if (!Array.isArray(ids)) return [];

  const events = await fetchEvents();

  return ids.reduce(function (r: Array<Event>, id: string) {
    events.some(function (event: Event) {
      return id === event.id && r.push(event);
    });
    return r;
  }, []);
};

/** */
export const findLatestEvents = async ({ count }: { count?: number }): Promise<Array<Event>> => {
  const _count = count || 4;
  const allEvents = await fetchEvents();
  const now = new Date();

  const futureEvents = allEvents
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());


  return futureEvents ? futureEvents.slice(0, _count) : [];
};


/** */
export const getStaticPathsEventBlogList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogListRouteEnabled) return [];
  const allEvents = await fetchEvents();
  const now = new Date();

  const futureEvents = allEvents
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());

  return paginate(futureEvents, {
    params: { termine: EVENT_BLOG_BASE || undefined },
    pageSize: blogPostsPerPage,
  });
};

/** */
export const getStaticPathsArchivedEventBlogList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogListRouteEnabled) return [];
  const allEvents = await fetchEvents();
  const now = new Date();

  const futureEvents = allEvents
    .filter(event => new Date(event.date) < now)
    .sort((a, b) =>  new Date(b.date).valueOf() - new Date(a.date).valueOf());

  return paginate(futureEvents, {
    params: { termine: EVENT_BLOG_BASE || undefined },
    pageSize: blogPostsPerPage,
  });
};


/** */
export const getStaticPathsEventBlogPost = async () => {
  if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];
  return (await fetchEvents()).flatMap((event) => ({
    params: {
      termine: event.permalink,
    },
    props: { event },
  }));
};


/** */
export async function getRelatedEvents(originalEvent: Event, maxResults: number = 4): Promise<Event[]> {
  const allEvents = await fetchEvents();

  const sortedEvents = allEvents.sort(
  (a, b) =>
    Math.abs(originalEvent.date.valueOf() - a.date.valueOf()) -
    Math.abs(originalEvent.date.valueOf() - b.date.valueOf())
).slice(1);
  const selectedEvents: Event[] = [];
  let i = 0;
  while (selectedEvents.length < maxResults && i < sortedEvents.length) {
    selectedEvents.push(sortedEvents[i]);
    i++;
  }

  return selectedEvents;
}
