const HTMLParser = require('node-html-parser');
const parse = HTMLParser.parse;
const axios = require('axios').default;

const SearchByKeyWord = (url, text, found) => (new RegExp(/nothing/,"ig")).exec(text) ? found.add(url) : found;
const Crawl = (url, filter, visited, found, limiter) => {
    return axios.get(url)
                .then((results) => {
                    page = parse(results.data);
                    visited.add(url)
                    let updatedFound = filter(url,page.text, found);
                    let links = page.querySelectorAll('a').filter(achor => !!achor.getAttribute("href"))
                                                          .map(achor => mapUrlPath(achor.getAttribute("href"), limiter))
                                                          .filter(link => !visited.has(link) || new URL(link).origin === new URL(limiter).origin);
                    console.log("Visited Count", visited.size)
                    console.log("Found Count", updatedFound.size)

                    if(links.length === 0)
                        return updatedFound;
                    if(found.size >  10)
                        return updatedFound;
                    return Promise.all( links.map(url => Crawl(url, filter,visited, updatedFound, limiter )))
                })
                .catch(_=>{
                    visited.add(url)
                    console.log("Visited Count", visited.size);
                    console.log("Found Count", found.size);
                    return found;
                })
}

const mapUrlPath = (path, base)=> {
    return path.search(/https|http/ig) === -1?  new URL(path,base).toJSON(): path;
};

Crawl("https://support.cloudflare.com/", SearchByKeyWord, new Set(), new Set(), "https://support.cloudflare.com/").then(results => {
                                                                                                                        JSON.stringify(results);
                                                                                                                    });