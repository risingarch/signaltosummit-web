import { chromium } from 'playwright';

const BASE_URL = 'https://signaltosummit-web.vercel.app';

const pages = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/content', name: 'Content Hub' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/thesis', name: 'Thesis' },
  { path: '/privacy', name: 'Privacy' },
];

async function testNavigation() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  let errors: string[] = [];
  let passes: string[] = [];
  
  for (const p of pages) {
    const url = BASE_URL + p.path;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    const status = response?.status() || 0;
    
    if (status !== 200) {
      errors.push(`${p.name} (${p.path}): HTTP ${status}`);
    } else {
      passes.push(`${p.name} (${p.path}): HTTP 200`);
    }
    
    // Check all nav links exist
    const navLinks = await page.$$('nav a');
    if (navLinks.length === 0) {
      errors.push(`${p.name}: No nav links found`);
    }
    
    // Check footer exists
    const footer = await page.$('footer');
    if (!footer) {
      errors.push(`${p.name}: No footer found`);
    }
    
    // Check h1 exists
    const h1 = await page.$('h1');
    if (!h1) {
      errors.push(`${p.name}: No h1 found`);
    }
    
    // Check for broken images
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({ src: img.src, complete: img.complete, naturalWidth: img.naturalWidth }))
    );
    for (const img of images) {
      if (img.naturalWidth === 0) {
        errors.push(`${p.name}: Broken image: ${img.src}`);
      }
    }
  }
  
  // Test 404 page
  const response404 = await page.goto(BASE_URL + '/nonexistent-page', { waitUntil: 'networkidle' });
  if (response404?.status() === 404) {
    passes.push('404 page: Correct 404 response');
  } else {
    errors.push(`404 page: Expected 404, got ${response404?.status()}`);
  }
  
  // Test mobile menu
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const hamburger = await mobilePage.$('#mobile-menu-button');
  if (hamburger) {
    await hamburger.click();
    const menu = await mobilePage.$('#mobile-menu');
    const isVisible = menu ? await menu.isVisible() : false;
    if (isVisible) {
      passes.push('Mobile menu: Opens on click');
    } else {
      errors.push('Mobile menu: Does not open on click');
    }
  } else {
    errors.push('Mobile menu: Hamburger button not found');
  }
  
  console.log('\n=== NAVIGATION QA RESULTS ===\n');
  console.log('PASSES:');
  passes.forEach(p => console.log(`  ✓ ${p}`));
  console.log('\nERRORS:');
  if (errors.length === 0) {
    console.log('  None!');
  } else {
    errors.forEach(e => console.log(`  ✗ ${e}`));
  }
  console.log(`\nTotal: ${passes.length} passed, ${errors.length} failed`);
  
  await browser.close();
}

testNavigation().catch(console.error);
