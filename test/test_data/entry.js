console.log('hello world');
import(/* webpackChunkName: "lazy" */ './lazy').then(module => {
  const print = module.default;

  print();
});
import(/* webpackChunkName: "lazy" */ './lazy.css');
