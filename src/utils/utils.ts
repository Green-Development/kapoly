import { I18N } from 'astrowind:config';

export const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(I18N?.language, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export const getFormattedDate = (date: Date): string => (date ? formatter.format(date) : '');

export const trim = (str = '', ch?: string) => {
  let start = 0,
    end = str.length || 0;
  while (start < end && str[start] === ch) ++start;
  while (end > start && str[end - 1] === ch) --end;
  return start > 0 || end < str.length ? str.substring(start, end) : str;
};

// Function to format a number in thousands (K) or millions (M) format depending on its value
export const toUiAmount = (amount: number) => {
  if (!amount) return 0;

  let value: string;

  if (amount >= 1000000000) {
    const formattedNumber = (amount / 1000000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'B';
    } else {
      value = formattedNumber + 'B';
    }
  } else if (amount >= 1000000) {
    const formattedNumber = (amount / 1000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'M';
    } else {
      value = formattedNumber + 'M';
    }
  } else if (amount >= 1000) {
    const formattedNumber = (amount / 1000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'K';
    } else {
      value = formattedNumber + 'K';
    }
  } else {
    value = Number(amount).toFixed(0);
  }

  return value;
};

export const notionTextToString = (text: Array<
  | { type: "text"; text: { content: string; link: { url: string } | null } }
  | { annotations: any; plain_text: string; href: string | null; type: "mention"; mention: any }
  | { annotations: any; plain_text: string; href: string | null; type: "equation"; equation: { expression: string } }
>): string => {
  return text.map((t) => {
    if (t.type === "text") {
      return t.text.content;
    } else if (t.type === "equation") {
      return `$${t.equation.expression}$`; // Represent equations in LaTeX-like syntax
    }
    return t.plain_text; // Works for mentions and other cases
  }).join("");
};

export const notionMultiSelectToStrings = (multi_select: Array<{
  id: string,
  name: string,
  color: string
}> | undefined): string[] =>
  multi_select?.map((tag) => tag.name ?? '') ?? [];
