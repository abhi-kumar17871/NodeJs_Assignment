const express = require('express');
const axios = require('axios');
const lodash = require('lodash');
const app = express();
const PORT = 3000;

const memoizedAnalytics = lodash.memoize(async function () {
  try {
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
      }
    });

    const blogs = response.data;

    const totalBlogs = blogs.length;
    const longestBlog = lodash.maxBy(blogs, 'title.length');
    const blogsWithPrivacy = lodash.filter(blogs, blog => lodash.includes(lodash.toLower(blog.title), 'privacy'));
    const uniqueBlogTitles = lodash.uniqBy(blogs, 'title').map(blog => blog.title);

    return {
      totalBlogs,
      longestBlog: longestBlog.title,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles,
    };
  } catch (error) {
    console.error(error.message);
    throw new Error('Error fetching and analyzing blog data');
  }
}, () => 300000); 

app.get('/api/blog-stats', async (req, res) => {
  try {
    const analyticsResults = await memoizedAnalytics();
    res.json(analyticsResults);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/blog-search', (req, res) => {
  try {
    const query = req.query.query.toLowerCase();
    const filteredBlogs = lodash.filter(blogs, blog => lodash.includes(lodash.toLower(blog.title), query));

    res.json({ results: filteredBlogs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
