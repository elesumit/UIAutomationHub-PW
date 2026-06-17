const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/run-tests', (req, res) => {
  const { env, suite, browser } = req.body;
  // Construct the command based on user input
  let cmd = `npx cucumber-js`;
  if (suite) cmd += ` --name ${suite}`;

  // Set environment variables if provided
  const execOptions = { cwd: '../', env: { ...process.env } };
  if (env) execOptions.env.ENV = env;
  if (browser) execOptions.env.BROWSER = browser;

  const processExec = exec(cmd, execOptions, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: stderr || error.message });
    } else {
      res.json({ output: stdout });
    }
  });
});

app.listen(port, () => {
  console.log(`UI Dashboard backend listening at http://localhost:${port}`);
});
