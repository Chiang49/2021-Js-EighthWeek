

let productsData = [];  //存放AJAX抓下來的商品列資料
const productList = document.querySelector('.js-productList'); //選取產品列表標籤

// step1------------------------

// AJAX 取得商品資料
function getProductList(){
 
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {

        productsData = response.data.products;
        renderProduct();
    })

}

//商品卡片html
function productCard(item){
    
    let str = `<li class="col-md-6 col-lg-3">
                <div class="productCard">
                    <div class="productCard-header">
                        <img src="${item.images}" alt="${item.title}">
                        <p class="productCard-new">${item.category}</p>
                    </div>
                    <div class="productCard-body">
                        <button class="productCard-addCarBtn" id="js-addCartBtn" data-id="${item.id}">加入購物車</button>
                        <h4 class="title-h4">${item.title}</h4>
                        <p class="productCard-price">NT$${item.origin_price}</p>
                        <p class="productCard-newPrice">NT$${item.price}</p>
                    </div>
                </div>
            </li>`;  

    return str;
}

// 渲染產品列表
function renderProduct(){
    
    let cards = "";
    productsData.forEach(function(item){
        
        cards += productCard(item);
    
    })

    productList.innerHTML = cards;
}

//初始畫面
function init(){
    getProductList();
    getShoppingCartData();
}

init();//執行初始畫面


// step2------------------------
const select = document.querySelector('.js-filter'); //選取篩選標籤

// 篩選產品列表函示
function filterProduct(filterItem){
    
    let filterData;
    let cards = "";
    filterData = productsData.filter(function(item){
        return item.category === filterItem;
    })
    
    filterData.forEach(function(item){
    
        cards += productCard(item);

    })

    productList.innerHTML = cards;

}

// 產品select篩選監聽
select.addEventListener('change',function(e){

    let filterItem = select.value;
    if(filterItem === "全部"){
        init();
    }else{
        filterProduct(filterItem);
    }
    
})



// step3------------------------
let shoppingCartData = [];  //存放AJAX抓下來的購物車資料
const shoppingCartList = document.querySelector('.js-shoppingCartList');//選取購物車標籤
const totalPrice = document.querySelector('.js-totalPrice');

// AJAX 取得購物車商品
function getShoppingCartData(){

    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {

        if(response.data.carts.length === 0){
            let str = "";
            str = `<li>
                        <ul class="row shoppingCart-card">
                        <p class="noProduct">購物車未有商品</p>
                        </ul>
                    </li>`;
            shoppingCartList.innerHTML = str;
        }else{
            shoppingCartData = response.data.carts;
            renderShoppingCart();
        }
       
        //取得總金額
        totalPrice.innerHTML = response.data.finalTotal;

    })

}

//顯示購物車內商品
function renderShoppingCart(){

    let str = "";
    shoppingCartData.forEach(function(item){
        
        str +=`<li>
                    <ul class="row shoppingCart-card">
                        <li class="col-10 col-md-11 col-lg-5 order-1 mb-1 mb-lg-0">
                            <div class="shoppingCart-product">
                                <img class="shoppingCart-img" src="${item.product.images}" alt="${item.product.title}">
                                <h4 class="title-h4">${item.product.title}</h4>
                            </div>
                        </li>
                        <li class="col-4 col-md-5 order-lg-2 order-3 col-lg-2">
                            <p><span class="d-lg-none">單價：</span>NT$${item.product.price}</p>
                        </li>
                        <li class="col-3 col-md-2 col-lg-2 order-4 order-lg-3">
                            <p><span class="d-lg-none">數量：</span>${item.quantity}</p>
                        </li>
                        <li class="col-5 col-md-5 col-lg-2 order-5 order-lg-4">
                            <p><span class="d-lg-none">金額：</span>NT$${item.product.price * item.quantity}</p>
                        </li>
                        <li class="col-2 col-md-1 col-lg-1 order-2 order-lg-5">
                            <a class="material-icons" id="js-delete" data-cartID="${item.id}">
                                close
                            </a>
                        </li>
                    </ul>
                </li>`;
    })

    shoppingCartList.innerHTML = str;
    
}


// step4------------------------

// 加入購物車btn
productList.addEventListener('click',function(e){
    
    if(e.target.getAttribute('id') === 'js-addCartBtn'){
        
        let productID = e.target.getAttribute('data-id');
        let numCheck = 1;

        shoppingCartData.forEach(function(item){
            
            if(e.target.getAttribute('data-id') === item.product.id){
                
                numCheck = item.quantity + 1;
                
            }
              
        })

        axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`, {
                "data": {
                    "productId": productID,
                    "quantity": numCheck
                  }
              })
              .then(function (response) {
                alert("加入購物車");
                getShoppingCartData();
              })
        
    }
})

// 購物車全部刪除
const deleteAll = document.querySelector('.js-deleteAll');

deleteAll.addEventListener('click',function(e){
    
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        alert("購物車已清空");
        getShoppingCartData();
    })

})

//刪除購物車特定商品
shoppingCartList.addEventListener('click',function(e){
    
    if(e.target.getAttribute('id') === "js-delete"){
       
        axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/chiang666/carts/${e.target.getAttribute('data-cartID')}`)
        .then(function(response){
            alert("刪除成功");
            getShoppingCartData();
        })

    }
})


// step5------------------------
const clientData = document.querySelector('.js-clientData');    //選取整個表單
const form = document.querySelectorAll('.js-clientData input,.js-clientData select'); //選取個別input & select
const sendBtn = document.querySelector('.js-sendBtn'); //選取送出按鈕

//確認表單填寫內容
function checkForm(){

    form.forEach(function(item){
        item.classList.remove('errorBorder');
        item.nextElementSibling.textContent = "";
    })

    // validate 設定
    var constraints = {
        "姓名": {
            presence: {
                message: "必填!"
            }
        },
        "電話": {
            presence: {
                message: "必填!"
            }
        },
        "Email": {
            presence: {
                message: "必填!"
            },
            email:{
                message: "格式錯誤"
            }
        },
        "地址": {
            presence: {
                message: "必填!"
            }
        },
        "交易方式": {
            presence: {
                message: "必填!"
            }
        }
    }

    let error = validate(clientData, constraints);
    let isError = false;

    if(error){   
        isError = true;
        Object.keys(error).forEach(function(key){
            
            let errorMessage = document.getElementsByName(key);
            errorMessage[0].classList.add('errorBorder');
            errorMessage[0].nextElementSibling.textContent = error[key];
        })
    }

    return isError;
}

// 個別表單輸入後檢查
form.forEach(function(item){
    item.addEventListener('change',function(){
        checkForm();
    })
})

// 檢查表單 & 購物車是否有資料 & 送出資料
sendBtn.addEventListener('click',function(){

    let formIsError;
    formIsError = checkForm();

    if(shoppingCartData.length === 0){
        alert("購物車裡沒有商品");
        return;
    }

    if(!formIsError){
        const name = document.querySelector('#name').value;
        const tel = document.querySelector('#tel').value;
        const email = document.querySelector('#email').value;
        const address = document.querySelector('#address').value;
        const payment = document.querySelector('#payment').value;

        axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`,{
            "data": {
                "user": {
                  "name": name,
                  "tel": tel,
                  "email": email,
                  "address": address,
                  "payment": payment
                }
              }
        })
        .then(function(response){
            alert("訂單送出");
            getShoppingCartData();
            clientData.reset();
        })
        
    }
    
})

