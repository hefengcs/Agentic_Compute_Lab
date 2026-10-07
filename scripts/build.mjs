import { readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Paths are relative to the project, regardless of the caller's working directory.
const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('data/content.json', root), 'utf8'));
const template = await readFile(new URL('src/template.html', root), 'utf8');
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const url = (value) => {
  if (!['https:', 'http:'].includes(new URL(value).protocol)) {
    throw new Error(`Expected an HTTP(S) link: ${value}`);
  }
  return escape(value);
};
const link = (label, href) => `<a href="${url(href)}">${escape(label)}</a>`;
const resources = (item, projectLabel = 'Project') => {
  const links = [['Paper', item.paper], ['Code', item.code], [projectLabel, item.project]]
    .filter(([, href]) => href)
    .map(([label, href]) => link(`[${label}]`, href));
  return links.length ? `<p class="resource-links">${links.join(' ')}</p>` : '';
};
const dateLabel = (date) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) throw new Error(`Use YYYY-MM for news dates: ${date}`);
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}-01T00:00:00Z`));
};

const values = {
  ...Object.fromEntries(Object.entries(data.site).map(([key, value]) => [key, escape(value)])),
  github: url(data.site.github),
  about: escape(data.about),
  news: [...data.news].sort((a, b) => b.date.localeCompare(a.date)).map((item) =>
    `<li><time datetime="${escape(item.date)}">${dateLabel(item.date)}</time><span>${item.url ? link(item.text, item.url) : escape(item.text)}</span></li>`
  ).join('\n'),
  research: data.research.map((item) =>
    `<div class="research-direction"><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p></div>`
  ).join('\n'),
  people: data.people.map((person) =>
    `<li><div>${person.url ? link(person.name, person.url) : escape(person.name)}</div><div class="role">${escape(person.role)}</div></li>`
  ).join('\n'),
  projects: data.projects.length ? `<ul class="plain-list">${data.projects.map((item) =>
    `<li class="entry"><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p>${item.status ? `<p class="metadata">Status: ${escape(item.status)}</p>` : ''}${item.contributors?.length ? `<p class="metadata">Contributors: ${escape(item.contributors.join(', '))}</p>` : ''}${resources(item, 'Project Page')}</li>`
  ).join('\n')}</ul>` : '',
  publications: data.publications.length ? `<ul class="plain-list">${data.publications.map((item) =>
    `<li class="entry"><h3>${escape(item.title)}</h3><p>${escape(item.authors.join(', '))}</p><p class="metadata">${escape(item.venue)} · ${escape(item.year)}</p>${resources(item)}</li>`
  ).join('\n')}</ul>` : '',
  join: data.join.paragraphs.map((paragraph) => `<p>${escape(paragraph)}</p>`).join('\n') +
    (data.join.email ? `\n<p>Contact: <a href="mailto:${escape(data.join.email)}">${escape(data.join.email)}</a></p>` : '')
};

// Empty collections omit both the section and its navigation link.
const html = template.replace(/\{\{#(projects|publications)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
  (_, key, content) => data[key].length ? content : ''
).replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Unknown template field: ${key}`);
  return values[key];
}).replace(/[\t ]+$/gm, '');
const output = new URL('docs/', root);
await mkdir(output, { recursive: true });
await cp(new URL('assets/', root), new URL('assets/', output), { recursive: true });
await writeFile(new URL('index.html', output), html);
await writeFile(new URL('.nojekyll', output), '');
console.log(`Built static site: ${fileURLToPath(output)}`);
