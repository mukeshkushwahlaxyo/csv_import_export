import React,{useState,useEffect} from 'react'
import { Table, Tag, Space } from 'antd';
import { Upload, Button ,Modal} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
  useComponentDidMount,
  useComponentDidUpdate,
  useComponentWillUnmount
} from './utils/hooks'
import { CSVLink, CSVDownload } from "react-csv";

import axios from 'axios';
import './App.css'
const baseUrl = 'https://dashboard.hithere.co.nz/api/';



const App = () =>{

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'name',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'age',
    },
    {
      title: 'State',
      dataIndex: 'status',
      key: 'address',
    },
    {
      title: 'Date',
      dataIndex: 'datetime',
      key: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <a onClick={(()=>updateData(record.id))}>Edit</a>
          <a onClick={()=>deleteRecord(record.id)}>Delete</a>
        </Space>
      ),
    },
  ];

  const [list,setList] = useState([])
  const [isModalVisible,setIsModalVisible] = useState(false)
  const [update,setUpdate] = useState(false) 
  const [titleError,setTitleError]= useState('')
  const [descError,setDescError]= useState('')
  const [statusError,setStatusError]= useState('')
  const [csvData,setCsvData]= useState(false)
  const [fileError,setError] = useState(false)

  useComponentDidMount(() => {
    getData()
  });
  useEffect(()=>{

  },[list.length])
  
  const getData = async() =>{
    let csv = [
      ['Title','Description','Status','Date']
    ]
    var data = await axios.get(`${baseUrl}getAgenda`).then((res)=>{
               return res
              })
              
    setList(data.data)        
    var newExcel = []
    data.data.map((value,key)=>{
      csv.push([value.title,value.description,value.status,value.datetime])
    })
    await setCsvData(csv)
  }

  const updateData = async(id) =>{
    axios.get(`${baseUrl}getAgenda/${id}`).then((res)=>{
      setUpdate(res.data)
      setIsModalVisible(true)

    }).catch((error)=>{
      console.log('error',error)
    })
  }

  const importFile =(event)=>{
    let form = new FormData()
    form.append('file',event.target.files[0])
    axios.post(`${baseUrl}uploadAgenda`,form).then((res)=>{
      console.log('res',res)
    }).catch((error)=>{
      setError(error.response.data.error)
    })
  }
  console.log('fileError',fileError)
  const handleCancel = () =>{
    setIsModalVisible(false)
  }


  const deleteRecord = (id) =>{
    axios.delete(`${baseUrl}deleteAgenda/${id}`).then((res)=>{
      console.log('res',res)
      setList(res.data)
    }).catch((error)=>{
      console.log('error',error)
    })
  }

  const updateRecord=async(event)=>{
    event.preventDefault()
    var title = event.target.title.value
    var description = event.target.description.value
    var status = event.target.status.value
    if(title ===''){
      setTitleError('Please Enter The Value!')
    }
    if(description === ''){
      setDescError('Please Enter The Value!')
    }
    if(status === ''){
      setStatusError('Please Enter The Value!')
    }

    let csv = [
      ['Title','Description','Status','Date']
    ]
    var data= await  axios.put(`${baseUrl}updateAgenda/${update.id}`,{title,description,status}).then((res)=>{
                        return res
                      }).catch((error)=>{
                        console.log('error',error)
                      })
    setList(data.data)
    setIsModalVisible(false)
    data.data.map((value,key)=>{
      csv.push([value.title,value.description,value.status,value.datetime])
    })
    await setCsvData(csv)

  }
  return (
    <>
      
      <div style={{display:'flex'}}>
        <div>
          <input type={'file'} onChange={(event)=>importFile(event)}/>
        </div>
        <div>
          {csvData ? <CSVLink  filename={"agenda.csv"} data={csvData}>Download me</CSVLink>:''}
        </div>
      </div>
      <div>
        <Table columns={columns} dataSource={list} />
      </div>  
      <div>
        {fileError ?fileError.map((value,key)=>(
          <div style={{color:'red'}}>{value}</div>
        )):''}
      </div>
      <Modal
        visible={isModalVisible} 
        onCancel={handleCancel}
        footer={null}
        >
        
        <form
          onSubmit={(event)=>updateRecord(event)}
        >
            <div>
              <input defaultValue={update ? update.title:''} name="title" placeholder='Please Enter Title'/>
              <div style={{color:'red'}}>{titleError}</div>
            </div>
            <div>
              <input checked={update?.title} type="checkbox" name="status" />
              <div style={{color:'red'}}>{descError}</div>
            </div>
            <div>
              <textarea name="description" placeholder='Please Enter Title'>
              {update ? update.description:''}  
              </textarea> 
              <div style={{color:'red'}}>{statusError}</div>
            </div>
            <div>
              <button type='submit'>Update</button>
            </div>
        </form>
      </Modal>
    </>
  )
}

export default App;