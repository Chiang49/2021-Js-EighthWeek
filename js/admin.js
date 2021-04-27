
let urlOrder = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`

let orderData = [];     //存取訂單資料
const headers = {authorization:token};
const orderList = document.querySelector('.js-orderList');//選取訂單表
const deleteAllBtn = document.querySelector('.js-deleteAllBtn');//選取全部刪除紐


// 初始畫面
function init(){
    getOrderDtat();
}
init();

// AJAX 取得訂單資料
function getOrderDtat(){

    axios.get(urlOrder,{

        headers

    })
    .then(function(response){
        orderData = response.data.orders;
        renderOrderData();
        c3_data_category();
        c3_data_item();
    })
    
}

//渲染訂單資料
function renderOrderData(){

    let str = "";

    if(orderData.length === 0){
        str = `<tr>
                    <td colspan="8" class="noOrder">未有訂單</td>
                </tr>`;
    }else{
        orderData.forEach(function(item){

            //日期時間轉換
            let orderTime = new Date(item.createdAt*1000);
            let orderM = orderTime.getMonth()+1;
            if(orderM.toString().length === 1){
                orderM = "0" + orderM;
            }
            let orderD = orderTime.getDate();
            if(orderD.toString().length === 1){
                orderD = "0" +orderD;
            }
            // console.log(orderM)
            let orderDay = `${orderTime.getFullYear()}/${orderM}/${orderD}`;
            
            //判斷訂單狀態
            let orderStatus = "";
            if(item.paid === false){
                orderStatus = "未處理"
            }else{
                orderStatus = "已處理"
            }
    
            // 顯示商品購買數量
            let products = ""; 
            item.products.forEach(function(productsItem){
                products += `<p>${productsItem.title}x${productsItem.quantity}</p>`
            })
                str += `<tr>
                        <td>${item.id}</td>
                        <td>
                            <p>${item.user.name}</p>
                            <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>
                            <a class="a-link" href="mailto:${item.user.email}">${item.user.email}</a>
                        </td>
                        <td>${products}</td>
                        <td>${orderDay}</td>
                        <td><a class="a-link" id="js-status" data-status="${item.paid}" data-statusID="${item.id}" href="">${orderStatus}</a></td>
                        <td>
                            <button class="deleteBtn" id="js-deleteBtn" data-orderID="${item.id}">刪除</button>
                        </td>
                    </tr>`;

        })
    }

    orderList.innerHTML = str;
    
}

//訂單全部刪除
deleteAllBtn.addEventListener('click',function(){

    if(orderData.length === 0){
        alert("已沒有訂單")
    }else{
        axios.delete(urlOrder,{

            headers

        })
        .then(function(response){
            alert("訂單已全部刪除");
            getOrderDtat();
        })
    }
    
})

//單筆訂單刪除 & 更改訂單狀態
orderList.addEventListener('click',function(e){
    
    e.preventDefault(); //取消預設動作

    //刪除單筆訂單
    if(e.target.getAttribute('id') === "js-deleteBtn"){
        axios.delete(`${urlOrder}/${e.target.getAttribute('data-orderID')}`,{
            
            headers

        })
        .then(function(response){
           alert("訂單刪除成功");
           getOrderDtat();
        })
    }

    //更改訂單狀態
    if(e.target.getAttribute('id') === "js-status"){
      
        let newStatus;
        if(e.target.getAttribute('data-status') == "false"){
            newStatus = true;
        }else{
            newStatus = false;
        }
        
        axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,
        {
            "data": {
                "id": `${e.target.getAttribute('data-statusID')}`,
                "paid": newStatus
              }
        },
        {

            headers

        })
        .then(function(response){
           alert("訂單已狀態修改");
           getOrderDtat();
        })
    }
    
})



//C3 顯示資料 - 全產品類別營收比重
function c3_data_category(){
    let kind = [];              //存放所有類別與價錢
    let allKindNum = {};        //存放相同類別與價錢相加
    let c3ArrayData = [];       //存放c3.js 格式資料

    //抓取所有訂單商品類別與價錢
    orderData.forEach(function(item){
        item.products.forEach(function(item){
            let obj = {};
            obj.category = item.category;
            obj.price = item.price * item.quantity;
            kind.push(obj);
        })
    })
   
     //整理相同類別與價錢相加
    kind.forEach(function(item){
        if(allKindNum[item.category] === undefined){
            allKindNum[item.category] = item.price;
        }else{
            allKindNum[item.category] += item.price;
        }
       
    })
    
    //整理成cs.js要求的格式
    Object.keys(allKindNum).forEach(function(item){
        let ary = [];
        ary.push(item, allKindNum[item]);
        c3ArrayData.push(ary);
    })

    //C3.js 資料圖表顯示
    let chart = c3.generate({
        bindto: '#categoryRevenue',
        data: {
            columns: c3ArrayData,
            type : 'pie',
        }
    })
   
}

//C3 顯示資料 - 全品項營收比重
function c3_data_item(){
    let orderProducts = {};     //存放"訂單"商品名與銷售額

    //抓取所有訂單商品名與價格
    orderData.forEach(function(item){
        item.products.forEach(function(product){
            if(orderProducts[product.title] === undefined){
                orderProducts[product.title] = product.price * product.quantity;
            }else{
                orderProducts[product.title] += product.price * product.quantity;
            }
        })
    })
   
    allProductsRank();
  
    //商品銷售排名
    function allProductsRank(){

        let orderTitle = [];
        orderTitle = Object.keys(orderProducts);

        //把物件轉成陣列包物件
        let rankAllProduct = [];
        orderTitle.forEach(function(item){
            let obj = {};
            obj.title = item;
            obj.price = orderProducts[item];
            rankAllProduct.push(obj)
        })
        
        //陣列排序大到小
        rankAllProduct.sort(function(a,b){
            return b.price - a.price;
        })
        
        c3Data(rankAllProduct);
    }

    // 整理成c3.js 格式
    function c3Data(rankAllProduct){
         
         const n = rankAllProduct.length;
        
         let c3ArrayData = [];
         // 整理出1~3名商品成c3.js格式
         for(let i = 0; i < 3; i++){
             let ary = [];
             ary.push(rankAllProduct[i].title,rankAllProduct[i].price);
             c3ArrayData.push(ary);
         }

         //如果有第四以後的商品在相加，整理成c3.js格式
         if(n > 3){
            let ary =[];
            let total = 0;
            for(let i = 3; i <= n-1 ; i++ ){
                total += rankAllProduct[i].price;
            }
            ary.push("其他",total);
            c3ArrayData.push(ary); 
         }

        
        // C3.js 資料圖表顯示
        let chart = c3.generate({
                bindto: '#itemRevenue',
                data: {
                    columns: c3ArrayData,
                    type : 'pie',
                }
        });
 
    }

}