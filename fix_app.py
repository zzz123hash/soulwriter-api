#!/usr/bin/env python3
import re

with open('dashboard/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace renderWelcome function using line-by-line approach
lines = content.split('\n')
new_lines = []
skip = 0
in_renderWelcome = False

for i, line in enumerate(lines):
    if '// ============ 欢迎页 ============' in line:
        new_lines.append(line)
        new_lines.append('function renderWelcome() {')
        new_lines.append('  return `<div class="welcome-page">')
        new_lines.append('    <header class="welcome-header">')
        new_lines.append('      <h1 class="app-logo">SoulWriter</h1>')
        new_lines.append('      <p class="app-slogan">${t(\'app.subtitle\')}</p>')
        new_lines.append('    </header>')
        new_lines.append('    <section class="bookshelf-section">')
        new_lines.append('      <h2 class="section-title">📚 ${t(\'common.bookshelf\')}</h2>')
        new_lines.append('      <div class="bookshelf" id="books-list"><div class="loading-text">${t(\'common.loading\')}</div></div>')
        new_lines.append('    </section>')
        new_lines.append('    <div class="create-book-area">')
        new_lines.append('      <button class="btn-create-book" id="create-book-btn">')
        new_lines.append('        <span class="btn-icon">+</span>')
        new_lines.append('        <span class="btn-text">${t(\'book.create\')}</span>')
        new_lines.append('      </button>')
        new_lines.append('      <button class="btn-create-book" id="import-book-btn" style="background:#4f46e5">')
        new_lines.append('        <span class="btn-icon">📥</span>')
        new_lines.append('        <span class="btn-text">${t(\'book.import\')}</span>')
        new_lines.append('      </button>')
        new_lines.append('    </div>')
        new_lines.append('  </div>`;')
        new_lines.append('}')
        skip = 9
        continue
    if skip > 0:
        skip -= 1
        continue
    new_lines.append(line)

content = '\n'.join(new_lines)

with open('dashboard/js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done!')
