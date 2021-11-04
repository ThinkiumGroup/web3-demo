npm run build
ssh stephen@43.247.184.53 -p 52919 "mkdir /var/www/dev-demo ; cd /var/www/dev-demo ; rm -rf *"
scp  -P 52919 -r  ./build/* stephen@43.247.184.53:/var/www/dev-demo

