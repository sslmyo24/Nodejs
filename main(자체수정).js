const http = require('http'),
	  fs = require('fs'),
	  url = require('url'),
	  qs = require('querystring'),
	  layout = require('./lib/layout.js'),
	  path = require('path');
let page = ['/', '/create', '/create_process', '/update', '/update_process', '/delete', '/delete_process'];

const app = http.createServer((req,res) => {
	const r_url = req.url,
		  queryData = url.parse(r_url, true).query,
		  pathname = url.parse(r_url, true).pathname;
	let title = queryData.id;

	if (page.indexOf(pathname) !== -1) {
		fs.readdir('./data', (err, filelist) => {
			let filteredId = path.parse(title).base;
			let list = layout.list(filelist);
			if (pathname === '/') {
				if (title === undefined) {
					title = 'Welcome';
					description = 'Hello, Node.js';
					const template = layout.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
					res.writeHead(200);
					res.end(template);
				} else {
					fs.readFile(`data/${title}`, 'utf8', (err, data) => {
						description = data;
						const template = layout.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a> <a href="/update?id=${title}">update</a> <a href="/delete?id=${title}">delete</a>`);
						res.writeHead(200);
						res.end(template);
					});
				}
			} else if (pathname === '/create') {
				const template = layout.HTML(title, list, `
					<fieldset>
						<legend>글작성</legend>
						<form action="/create_process" method="post">
							<p><span>title : </span><input type="text" name="title" placeholder="title" /></p>
							<p>
								<textarea style="width:500px;height:100px;" name="description" placeholder="description"></textarea>
							</p>
							<button type="submit">Submit</button>
						</form>
					</fieldset>
				`, '');
				res.writeHead(200);
				res.end(template);
			} else if (pathname === '/update') {
				fs.readFile(`data/${title}`, 'utf8', (err, data) => {
					const template = layout.HTML(title, list, `
						<fieldset>
							<legend>글수정</legend>
							<form action="/update_process" method="post">
								<input type="hidden" name="id" value="${title}" />
								<p><span>title : </span><input type="text" name="title" placeholder="title" value="${title}" /></p>
								<p>
									<textarea style="width:500px;height:100px;" name="description" placeholder="description">${data}</textarea>
								</p>
								<button type="submit">Submit</button>
							</form>
						</fieldset>
					`, '');
					res.writeHead(200);
					res.end(template);
				});
			} else if (pathname === '/delete') {
				const template = layout.HTML(title, list, `<p>정말 삭제하시겠습니까?</p><a href="/delete_process?id=${title}">네</a>		<a href="/?id=${title}">아니요</a>`, '');
				res.writeHead(200);
				res.end(template);
			} else if (pathname.indexOf('process')) {
				const action = pathname.substr(1).replace('_process','');
				if (action !== 'delete') {
					let body = '';
					req.on('data', data => {
						body += data;
					});
					req.on('end', () => {
						const post = qs.parse(body);
						const title = post.title;
						const description = post.description;
						if (action === 'update') {
							const id = post.id;
							fs.renameSync(`data/${id}`, `data/${title}`);
						}
						fs.writeFile(`data/${title}`, description, 'utf8', err => {
							res.writeHead(302, {Location: `/?id=${title}`});
							res.end();
						});
					});
				} else {
					fs.unlink(`data/${title}`, err => {
						if (err) {
							throw err;
						}
						res.writeHead(302, {Location: `/`});
						res.end();
					});
				}
			}
		})
	} else {
		res.writeHead(404);
		res.end('Not Found');		
	}
})
app.listen(3000);