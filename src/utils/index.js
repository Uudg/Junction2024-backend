import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

export const parseGlassdor = async (location, query) => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.glassdoor.com/Job/jobs.htm');

    // Wait for the form elements to load
    await page.waitForSelector('#searchBar-jobTitle');
    await page.waitForSelector('#searchBar-location');

    // Fill in the job type field with a slower typing speed
    await page.type('#searchBar-jobTitle', query, { delay: 100 });

    // Fetch location suggestions
    const locationDataUrl = `https://www.glassdoor.com/autocomplete/location?locationTypeFilters=CITY,COUNTRY&caller=jobs&term=${location}`;
    const response = await fetch(locationDataUrl);
    const locationData = await response.json();

    let loc = '';
    if (locationData.length > 0) {
        loc = locationData[0].label;
    }

    // Fill in the location field with the extracted label with a slower typing speed
    await page.type('#searchBar-location', loc, { delay: 100 });

    // Submit the form
    await page.keyboard.press('Enter');

    // Wait for the job list to load
    await page.waitForSelector('.JobsList_wrapper__EyUF6');

    // Parse the job data
    const jobs = await page.evaluate(() => {
        let jobElements = document.querySelectorAll('.JobCard_jobCardWrapper__lyvNS');
        let jobData = [];
        jobElements.forEach(job => {
            let title;
            let company;
            let salary;

            try {
                title = job.querySelector('.JobCard_jobTitle___7I6y').innerText;
            } catch (e) {
                title = "N/A";
            }
            try {
                company = job.querySelector('.EmployerProfile_compactEmployerName__LE242').innerText;
            } catch (e) {
                company = "N/A";
            }
            try {
                salary = job.querySelector('.JobCard_salaryEstimate__arV5J').innerText;
            } catch (e) {
                salary = "N/A";
            }
            jobData.push({ title, company, salary });
        });
        return jobData;
    });

    await browser.close();
    return jobs;
}

export const getLinks = async (location, query) => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const searchQuery = `${query} job ${location}`;
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);

    // Wait for the search results to load
    await page.waitForSelector('div#search');

    // Extract the first 10 links from the search results
    const links = await page.evaluate(() => {
        const linkElements = document.querySelectorAll('div#search a');
        const linkArray = [];
        for (let i = 0; i < linkElements.length && linkArray.length < 10; i++) {
            const href = linkElements[i].href;
            if (href) {
                linkArray.push(href);
            }
        }
        return linkArray;
    });

    await browser.close();
    return links;
}