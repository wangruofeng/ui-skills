import type { APIRoute } from "astro";
import { skills } from "../../data/skills";
import { playbook } from "../../data/playbook";
export const prerender = true;
export const GET: APIRoute = () => new Response(JSON.stringify([
  ...skills.map(skill => ({kind:"skill",slug:skill.slug,pathSlug:skill.pathSlug,href:`/skills/${skill.pathSlug}`,label:skill.label,sourceLabel:skill.sourceLabel,description:skill.description})),
  ...playbook.map(entry => ({kind:"playbook",slug:entry.slug,pathSlug:entry.slug,href:`/playbook/${entry.slug}`,label:entry.title,sourceLabel:"Playbook",description:entry.description})),
]),{headers:{"Content-Type":"application/json; charset=utf-8"}});
