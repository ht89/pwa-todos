self.addEventListener('fetch', (event) => {
  console.log('Fetch request for:', event.request.url);
});
