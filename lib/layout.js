module.exports = {
	HTML: (title, list, body, control) => {
		return `
			<!doctype html>
			<html>
			<head>
			  <title>WEB1 - ${title}</title>
			  <meta charset="utf-8">
			</head>
			<body>
				<h1><a href="/">WEB</a></h1>
				${list}
				${control}
				${body}
			</body>
			</html>`;
	},
	list: filelist => {
		let list = '';
		for (const file of filelist) {
			list += `<li><a href="/?id=${file}">${file}</a></li>`;
		}
		return `<ol>${list}</ol>`;
	}
}