import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement, type ReactElement } from 'react';
import { translateText, localizedHref } from '../public/i18n-core.mjs';
import { localizeUiTree } from '../src/lib/ui-localization';
const words = { 'Copy': '复制', 'Search skills': '搜索技能', 'No results found.': '没有找到结果。' };
const t = (value: string) => translateText(value, words);
test('normalizes whitespace and preserves surrounding space', () => {
  assert.equal(t('  Search\n skills '), '  搜索技能 ');
  assert.equal(t('React'), 'React');
});
test('localizes variable labels without changing names and counts', () => {
  assert.equal(t('Open React on GitHub'), '在 GitHub 打开 React');
  assert.equal(t('24 results'), '24 条结果');
  assert.equal(t('View ibelick skills'), '查看 ibelick 的技能');
});
test('language links retain query and hash while APIs and files stay intact', () => {
  assert.equal(localizedHref('/library/?q=test#saved', false), '/en/library/?q=test#saved');
  for (const url of ['/api/auth/status', '/data/search-index.json', '/en/skills/', 'https://github.com']) assert.equal(localizedHref(url, false), url);
  assert.equal(localizedHref('/jobs', true), 'https://www.ui-skills.com/jobs');
});
test('React renders translated labels, children and links without mutating source elements', () => {
  const original = createElement('a', { href: '/skills/', 'aria-label': 'Search skills' }, 'Copy');
  const rendered = localizeUiTree(original, t, false) as ReactElement<Record<string, unknown>>;
  assert.equal(rendered.props['aria-label'], '搜索技能');
  assert.equal(rendered.props.href, '/en/skills/');
  assert.equal(rendered.props.children, '复制');
  assert.equal(original.props['aria-label'], 'Search skills');
});
test('code and original-language skill content are never translated', () => {
  for (const element of [createElement('code', {}, 'Copy'), createElement('div', { 'data-original-content': true }, 'Copy')]) assert.equal(localizeUiTree(element, t, true), element);
});

test('preserves the single element contract of tooltip and render primitives', () => {
  const Trigger = (_props: {children: ReactElement}) => null;
  const node = createElement(Trigger, {children: createElement('button', {}, 'Copy')});
  const rendered = localizeUiTree(node, t, true) as ReactElement<{children: ReactElement<{children: string}>}>;
  assert.equal(rendered.props.children.type, 'button');
  assert.equal(rendered.props.children.props.children, '复制');
});

test('unknown prototype property names are treated as plain source text', () => {
  assert.equal(t('constructor'), 'constructor');
  assert.equal(t('toString'), 'toString');
});

test('explicit brand names stay unchanged even when a common label has a translation', () => {
  const node = createElement('a', { translate: 'no', href: 'https://motion.dev' }, 'Motion');
  assert.equal(localizeUiTree(node, value => value === 'Motion' ? '动效' : value, true), node);
});
