(function(){
  const books=window.AETERNUS_BOOKS||[];
  const modal=document.getElementById('book-modal');
  if(!modal)return;
  const fields={title:document.getElementById('modal-title'),subtitle:document.getElementById('modal-subtitle'),metadata:document.getElementById('modal-metadata'),summary:document.getElementById('modal-summary'),sample:document.getElementById('modal-sample'),amazon:document.getElementById('modal-amazon'),monogram:document.getElementById('modal-monogram')};
  let lastTrigger=null;
  function openBook(index,trigger){
    const book=books[index];if(!book)return;
    lastTrigger=trigger;
    fields.title.textContent=book.title;fields.subtitle.textContent=book.subtitle;fields.metadata.textContent=book.metadata;fields.summary.textContent=book.summary;fields.sample.textContent=book.sample;fields.amazon.href=book.amazon;fields.monogram.textContent=String(index+1).padStart(2,'0');
    modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');modal.querySelector('.modal-close').focus();
  }
  function closeBook(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(lastTrigger)lastTrigger.focus()}
  document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',()=>openBook(Number(button.dataset.book),button)));
  document.querySelectorAll('[data-close-modal]').forEach(button=>button.addEventListener('click',closeBook));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&modal.classList.contains('is-open'))closeBook();
    if(event.key!=='Tab'||!modal.classList.contains('is-open'))return;
    const focusable=Array.from(modal.querySelectorAll('button,a[href]'));const first=focusable[0];const last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
})();
