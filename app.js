const http = require('http');
const args = require('yargs')
  .usage('Usage: $0 [-delay "time"] [-lifetime "time"]')
  .option('delay', {
    alias: 'D',
    describe: 'Interval in ms',
    type: 'nember'
  })
  .option('lifetime', {
    alias: 'L',
    describe: 'App lifetime in ms',
    type: 'number'
  })
  .help('?')
  .alias('?', 'help')
  .example('$0 -D 1000 -L 3000')
  .demandOption(
    ['delay', 'lifetime'],
    'Необходимо указать интервал вывода времени в консоль и время жизни приложения.'
  ).argv;

const port = 3000;
const delay = args.delay;
const lifetime = args.lifetime;
let clientId = 0;

const showDate = (client, delay, lifetime) => {
  const startTime = new Date();
  const refreshInterval = setInterval(() => {
    let currentTime = new Date();
    console.log(`Клиент ${client} ${currentTime.toLocaleString()}`);
    if (currentTime.getTime() >= startTime.getTime() + lifetime) {
      clearInterval(refreshInterval);
      console.log(`Клиент ${client} время вышло! ${currentTime.toLocaleString()}`);
    }
  }, delay);
};

const server = http.createServer((req, res) => {
  if (req.url !== '/favicon.ico') {
    const client = ++clientId;
    console.log(`Клиент ${client} подключился к серверу!`);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`Вы подключились к серверу, посмотрите что творится в консоли!`);
    showDate(client, delay, lifetime);
  }
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
