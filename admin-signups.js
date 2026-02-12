// JavaScript source code
if (url.pathname === "/admin-signups") {
    const list = await env.SIGNUPS.list();
    let rows = "";

    for (const key of list.keys) {
        const value = await env.SIGNUPS.get(key.name);
        const data = JSON.parse(value);

        rows += `
      <tr>
        <td>${data.name}</td>
        <td>${data.email}</td>
      </tr>
    `;
    }

    return html(`
    <html>
    <head>
      <style>
        body { font-family: system-ui; background:#111; color:white; padding:40px; }
        table { width:100%; border-collapse:collapse; }
        td, th { padding:10px; border-bottom:1px solid #333; }
      </style>
    </head>
    <body>
      <h1>Project Signups</h1>
      <table>
        <tr><th>Name</th><th>Email</th></tr>
        ${rows}
      </table>
    </body>
    </html>
  `);
}
