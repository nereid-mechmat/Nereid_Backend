import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { adminRouter } from './routers/AdminRouter.ts';
import { userRouter } from './routers/UserRouter.ts';

const app = new Hono();

// TODO: set cors so only frontend can have access
app.use(cors());
app.use(prettyJSON());

app.route('/user', userRouter);
app.route('/admin', adminRouter);

app.get('/healthy', (c) => {
	return c.text('healthy');
});

app.onError((err, c) => {
	console.log('something went wrong on the server side. Error:');
	console.error(err);
	return c.text('something went wrong on the server side.', 500);
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

const main = async () => {
	serve({
		fetch: app.fetch,
		port,
	});
};

main();
