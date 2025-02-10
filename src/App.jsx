import axios from "axios";
//1.匯入useState
import { useState } from "react";

const BASE_URL=import.meta.env.VITE_BASE_URL;
const API_PATH=import.meta.env.VITE_API_PATH;


function App() {
  //登入後渲染產品頁面，所以要給個狀態,預設為false,登入後為true(渲染)
  const [isAuth,setIsAuth] = useState(false);

  const [tempProduct, setTempProduct] = useState({});
  const [products, setProducts] = useState([]);

  //2.設定一個 account 狀態
  const[account, setAccount] = useState({   
      username: "example@test.com",
      password: "example" 
  })

  //5.當 input 值發生改變時要觸發的函式
  const handleInputChange = (e) => {
    //測試：input輸入的值會顯示在console，利用解構將兩個值取出
    //console.log(e.target.value)
    //console.log(e.target.name)
    const { value , name }= e.target
    //將輸入的值帶回到 account 狀態中，因為狀態是物件所以傳入一個物件
    setAccount({
      //一次只能傳入一個input，但在此有兩個，所以將原本的值先展開
      //展開結果等於setAccount({       
        // username: "example@test.com",
        // password: "example" 
     // })
      ...account,
      //把name當作key傳入，當username的input發生變化時，[name]等於username，psssword亦同
      [name]: value
      
    })
    //console.log(account)
  }

  //登入按鈕綁監聽事件
  const handleLogin = (e) => {
    //透過表單觸發 submit 事件要記得使用 event.preventDefault() 取消 form 表單的預設行為：
    // 原本只能透過登入按鈕觸發，讓其也可以按enter觸發
    e.preventDefault();
  
    axios.post(`${BASE_URL}/v2/admin/signin`,account)
     .then((res) => {
      //透過解構將token和expired(過期日)從response取出
      const {token,expired} = res.data
      console.log(token,expired)
      //將 token 存進 cookie中
      document.cookie = `angelaToken=${token}; expires=${new Date (expired)}`;

      axios.defaults.headers.common['Authorization'] = token;

      //取得產品資料，因為是後台,需要在登入時在hraders帶入token，位置放在發送請求前
      axios.get(`${BASE_URL}/v2/api/${API_PATH}/admin/products`)
      .then((res) => 
        setProducts(res.data.products)
      )
      .catch((error) =>console.log(error))





      setIsAuth(true)
     }
    )
    .catch((error)=>
      alert("登入失敗"))
    //console.log(account)

  }

  //驗證登入api，無須用到res所以不用設res變數(const res = await axios...)
  const checkUserLogin = async() => {
    try{
      await axios.post(`${BASE_URL}/v2/api/user/check`)
      alert("使用者已登入")
    }
    catch(error) {
      console.log(error)
    }    
  };

  return (
  <>
    {/*有登入顯示loggedin，沒登入顯示登入頁面*/}
    {isAuth ? (<div className="container py-5">
      <div className="row">
        <div className="col-6">
          {/*新增一個按紐事件*/}
        <button onClick= {checkUserLogin} className="btn btn-success mb-5" type="button">檢查使用者是否登入</button>
          <h2>產品列表</h2>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">查看細節</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row">{product.title}</th>
                  <td>{product.origin_price}</td>
                  <td>{product.price}</td>
                  <td>{product.is_enabled}</td>
                  <td>
                    <button
                      onClick={() => setTempProduct(product)}
                      className="btn btn-primary"
                      type="button"
                    >
                      查看細節
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-6">
          <h2>單一產品細節</h2>
          {tempProduct.title ? (
            <div className="card">
              <img
                src={tempProduct.imageUrl}
                className="card-img-top img-fluid"
                alt={tempProduct.title}
              />
              <div className="card-body">
                <h5 className="card-title">
                  {tempProduct.title}
                  <span className="badge text-bg-primary">
                    {tempProduct.category}
                  </span>
                </h5>
                <p className="card-text">商品描述：{tempProduct.description}</p>
                <p className="card-text">商品內容：{tempProduct.content}</p>
                <p className="card-text">
                  <del>{tempProduct.origin_price} 元</del> / {tempProduct.price}{" "}
                  元
                </p>
                <h5 className="card-title">更多圖片：</h5>
                {tempProduct.imagesUrl?.map((image) => (image && (<img key={image} src={image} className="img-fluid" />)))}
              </div>
            </div>
          ) : (
            <p>請選擇一個商品查看</p>
          )}
        </div>
      </div>
    </div>) :  <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="mb-5">請先登入</h1>
      {/*登入按鈕綁監聽事件，onSubmit事件通常綁在form標籤*/}
      <form onSubmit = {handleLogin} className="d-flex flex-column gap-3">
        <div className="form-floating mb-3">
           {/*3.綁定登入頁面中input的value,email對應到username，
           4.在 input 監聽 onChange 事件，(觸發)當輸入input時value的值才會隨著改變
           6.需要知道是哪一個input在change，所以在input加上name屬性*/}
          <input name="username" value={account.username} onChange={handleInputChange} type="email" className="form-control" id="username" placeholder="name@example.com" />
          <label htmlFor="username">Email address</label>
        </div>
        <div className="form-floating">
          {/*3.綁定登入頁面中input的value,password對應到password，
          4.在 input 監聽 onChange 事件，(觸發)當輸入input時value的值才會隨著改變
          6.需要知道是哪一個input在change，所以在input加上name屬性*/}
          <input name="password" value={account.password} onChange={handleInputChange} type="password" className="form-control" id="password" placeholder="Password" />
          <label htmlFor="password">Password</label>
        </div>      
        <button  className="btn btn-primary">登入</button>
      </form>
      <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
    </div>}
  </>
  )
}

export default App
