start:
	pm2 start yarn --name eventando-manager -- run start

update:
	git pull
	yarn
	yarn build
	pm2 restart eventando-manager
