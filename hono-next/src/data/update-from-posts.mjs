import fs from 'fs';
import path from 'path';

const POSTS_JSON_PATH = path.join(process.cwd(), 'src/data/posts.json');
const README_PATH = path.join(process.cwd(), 'README.md');
const PAGE_TSX_PATH = path.join(process.cwd(), 'src/app/dashboard/page.tsx');

const START_MARKER = '<!-- POSTS_START -->';
const END_MARKER = '<!-- POSTS_END -->';

async function main() {
  if (!fs.existsSync(POSTS_JSON_PATH)) {
    console.error(`Error: ${POSTS_JSON_PATH} does not exist.`);
    process.exit(1);
  }

  const postsRaw = fs.readFileSync(POSTS_JSON_PATH, 'utf-8');
  const posts = JSON.parse(postsRaw);

  // 1. Update README.md
  if (fs.existsSync(README_PATH)) {
    let readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    
    if (readmeContent.includes(START_MARKER) && readmeContent.includes(END_MARKER)) {
      const postsMarkdown = posts.map(p => {
        return `- **Day ${p.day}**: [${p.title}](${p.url}) - ${p.description.split('\\n')[0]}`;
      }).join('\\n');

      const regex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`);
      readmeContent = readmeContent.replace(
        regex,
        `${START_MARKER}\\n${postsMarkdown}\\n${END_MARKER}`
      );

      fs.writeFileSync(README_PATH, readmeContent);
      console.log('✅ Updated README.md');
    } else {
      console.warn('⚠️  README.md does not contain the required POSTS_START and POSTS_END markers.');
    }
  }

  // 2. Update page.tsx
  if (fs.existsSync(PAGE_TSX_PATH)) {
    let pageTsxContent = fs.readFileSync(PAGE_TSX_PATH, 'utf-8');

    // Extract existing days
    const existingDaysMatch = pageTsxContent.match(/day:\s*"Day\s+(\d+)"/g);
    const existingDays = new Set(
      existingDaysMatch ? existingDaysMatch.map(m => parseInt(m.replace(/\\D/g, ''), 10)) : []
    );

    const newPosts = posts.filter(p => !existingDays.has(p.day)).reverse(); // Reverse to add ascending order

    if (newPosts.length > 0) {
      // Find the end of the projects array
      const startIndex = pageTsxContent.indexOf('const projects = [');
      // Look for the closing bracket after the last item
      const projectsEndIndex = pageTsxContent.indexOf('\n]', startIndex);
      
      if (projectsEndIndex !== -1) {
        const newProjectsCode = newPosts.map(p => {
          return `  {
    title: "${p.title.replace(/"/g, '\\"')}",
    description: "${p.description.replace(/\\u3010.*?\\u3011/g, '').replace(/"/g, '\\"').trim()}",
    link: "/day${String(p.day).padStart(3, '0')}",
    day: "Day ${p.day}",
  },`;
        }).join('\\n');

        pageTsxContent = 
          pageTsxContent.slice(0, projectsEndIndex) + 
          (pageTsxContent[projectsEndIndex - 1] === '\\n' ? '' : '\\n') +
          newProjectsCode + '\\n' + 
          pageTsxContent.slice(projectsEndIndex);

        fs.writeFileSync(PAGE_TSX_PATH, pageTsxContent);
        console.log(`✅ Updated page.tsx with ${newPosts.length} new projects.`);
      } else {
        console.warn('⚠️  Could not find projects array end in page.tsx');
      }
    } else {
      console.log('ℹ️  No new projects to add to page.tsx');
    }
  }
}

main().catch(console.error);
