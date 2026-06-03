function getDomElement(query) {
  return new Promise((resolve, reject) => {
    const checkElementExist = () => {
      const element = document.querySelector(query);
      if (element) {
        resolve(element);
      } else {
        setTimeout(checkElementExist, 500);
      }
    };
    checkElementExist();

    setTimeout(() => {
      const element = document.querySelector(query);
      if (!element) {
        reject(new Error('No se pudieron encontrar los elementos'));
      }
    }, 1000 * 60);
  });
}