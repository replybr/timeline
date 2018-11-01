const json2md = require("json2md")
const {
    readFileSync,
    writeFileSync
} = require('fs')

const BLOG_CONTENT_TAG = '$$blog-content$$'
const TALK_CONTENT_TAG = '$$talk-content$$'
const VIDEO_CONTENT_TAG = '$$video-content$$'

function sortByDate(prev, next) {

    const prevDate = new Date(prev.date)
    const nextDate = new Date(next.date)

    if (prevDate < nextDate) return 1
    if (prevDate > nextDate) return -1
    return 0

}

function mapPostMarkdown(item) {
    item.tags = item.tags.map(i => `\`${i}\``).join(', ')
    return [{
            h3: `[${item.date} - ${item.title} (${item.language})](${item.link})`
        }, {
            p: `Portal:`
        },
        {
            blockquote: `[${item.portal.name}](${item.portal.link})`
        },
        {
            p: "Abstract:"
        },
        {
            blockquote: item.abstract
        },
        {
            p: `_Tags: ${item.tags}_`
        }
    ];
}

function mapTalkMarkdown(item) {
    item.tags = item.tags.map(i => `\`${i}\``).join(', ')
    return [{
            h3: `${item.date} - ${item.title} (${item.language})`
        }, {
            p: `[${item.event.name}](${item.event.link})`
        },
        {
            p: `[slides](${item.slides}) ${item.photos ? `| [photos](${item.photos})` : ``} ${item.video ? `| [video](${item.video})`: ``}`
        },
        {
            p: "Abstract:"
        },
        {
            blockquote: item.abstract
        },
        {
            p: `_Tags: ${item.tags}_`
        }
    ];
}

function mapVideoMarkdown(item) {
    item.tags = item.tags.map(i => `\`${i}\``).join(', ')
    return [{
            h3: `[${item.date} - ${item.title} (${item.language})](${item.link})`
        },
        {
            p: "Abstract:"
        },
        {
            blockquote: item.abstract
        },
        {
            p: `_Tags: ${item.tags}_`
        }
    ];
}

function mapMarkdown(items, fn) {
    return items.sort(sortByDate).map(fn).reduce((prev, next) => prev.concat(next), [])
}

(() => {
    const data = readFileSync('resources/template.md', 'utf8').toString()

    const talks = getTextFile('resources/talks.json')
    const talksMd = mapMarkdown(talks, mapTalkMarkdown)

    const posts = getTextFile('resources/posts.json')
    const postMd = mapMarkdown(posts, mapPostMarkdown)

    const videos = getTextFile('resources/videos.json')
    const videosMd = mapMarkdown(videos, mapVideoMarkdown)


    const content = data
        .replace(TALK_CONTENT_TAG, json2md(talksMd))
        .replace(BLOG_CONTENT_TAG, json2md(postMd))
        .replace(VIDEO_CONTENT_TAG, json2md(videosMd))

    // console.log('content', content)

    writeFileSync('README.md', content)
    console.log('readme generated with success!')

})()

function getTextFile(path) {
    return JSON.parse(readFileSync(path));
}