import axios from "axios"
import * as actions from '../actions'
import requestUrls from "./requestUrls"
import {message} from 'antd'

axios.defaults.headers.common['authorization'] = localStorage.getItem("access_token");
export default {
    "getAllEmployees": (dispatch) =>{
        axios.defaults.headers.common['authorization'] = localStorage.getItem("access_token");
        axios.get(requestUrls.employees)
            .then((res) => {
                dispatch(actions.allEmployees(res.data))
            })
            .catch((error) => {
                console.log(error); 
            })
    },
    "getAllParkingboys": (dispatch) => axios.get(`${requestUrls.employees}?role=parkingboy`)
        .then((res) => {
            dispatch(actions.allparkingboys(res.data))
        })
        .catch((error) => {
            console.log(error);
        }),
    "getAllParkingLots": (dispatch) => 
        axios.get(requestUrls.parkingLots)
        .then((res) => {
            dispatch(actions.allParkingLots(res.data))
        })
        .catch((error) => {
            console.log(error);
        }),

    "getNoUserParkinglots": (dispatch)=> axios.get(requestUrls.parkingLots+"/noUser")
        .then(res=>{
            dispatch(actions.allParkingLots(res.data))
        })
        .catch(error => {
            console.log(error)
        }),

    "changeParkingLotStatus": (id, status, dispatch) =>
        axios.patch(`${requestUrls.parkingLots}/${id}`)
            .then(res => {
                if (res.status === 204) {
                    message.success(`停车场${status==="open"?"注销":"开放"}成功`);
                    // getAllParkingLots(dispatch);
                    axios.get(requestUrls.parkingLots)
                        .then((res) => {
                            dispatch(actions.allParkingLots(res.data))
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                }
            })
            .catch(error => {
                message.error(`停车场${status==="open"?"注销失败，已被分配的停车场无法注销":"开放失败"}`)
                console.log(error)
            }),
    "addEmployee": (dispatch, postData) =>
        axios.post(requestUrls.employees, postData)
            .then((res) => {
                message.success(`员工新增成功，该员工的账号是：${res.data.username}，密码是：${res.data.password}`)
                dispatch(actions.addEmployee(res.data))
            })
            .catch((error) => {
                message.error("账户名不能重复，新增员工失败")
                console.log(error);
            }),
    "addParkinglot": (dispatch, postData) =>{
        const {name, size} = postData;
        if(size.match(/\D/)==null){
            axios.post(requestUrls.parkingLots, postData)
                .then(res => {
                    dispatch(actions.addParkinglot(res.data));
                    message.success("停车场添加成功")
                })
                .catch(error => {
                    console.log(error);
                    message.error("停车场名重复，停车场添加失败")
                })
        }else{
            message.error("停车场信息格式错误，停车场添加失败")
        }
    },

    "modifyParkinglot": (id, car, value, dispatch) =>{
        if(car === 0){
            axios.put(`${requestUrls.parkingLots}/${id}`, value)
                .then(res => {
                    dispatch(actions.modifyParkinglot(res.data))
                    message.success("停车场修改成功")
                })
                .catch(error => {
                    // message.error("停车场有车时不能修改大小")
                    message.error("停车场修改失败");
                })
        }else{
            message.error("停车场有车时不能修改")
        }
    },

    "frozenAccount": (dispatch, id) => axios.patch(requestUrls.employees + "/" + id, {account_status: ""})
        .then(res => {
            dispatch(actions.handleAccountStatus(res.data));
        })
        .catch(error => {
            console.log(error);
        }),

    "getAllOrders": (dispatch) =>
        axios.get(requestUrls.orders)
        .then((res) => {
            dispatch(actions.allOrders(res.data))
        })
        .catch((error) => {
            console.log(error);
        }),
    "getAllParkingLotsInDashboard": (dispatch) =>
        axios.get(requestUrls.parkingLotsDashboard)
        .then((res) => {
            dispatch(actions.allParkingLotsInDashboard(res.data))
        })
        .catch((error) => {
            console.log(error);
        }),
    "updateEmployee": (dispatch, employee) => axios.patch(requestUrls.employees + "/" + employee.id, employee)
        .then((res) => {
            message.success("信息修改成功")
            dispatch(actions.updateEmployee(res.data))
        })
        .catch((error) => {
            message.error("manager已经存在，不能重复设置")
            console.log(error);
        }),
    "searchEmployees": (dispatch, searchValue) => axios.get(requestUrls.employees + "/search?" + searchValue.searchType + "=" + searchValue.searchValue + "")
        .then((res) => {
            dispatch(actions.searchEmployees(res.data))
        })
        .catch((error) => {
            console.log(error);
        }),

    "searchParkinglot": (value, searchType, dispatch) => {
        let search = `?${searchType}=${value}`;
        axios.get(requestUrls.parkingLotCombineSearch + search)
            .then(res => {
                dispatch(actions.allParkingLots(res.data));
            })
            .catch(error => {
                console.log(error);
            });
    },

    "assignParkinglot":(dispatch,userId, ids)=>{
        let path = `${requestUrls.employees}/${userId}/parkinglots/`
        ids.map(id=>{
            axios.patch(`${path}${id}`)
            .then(res=>{
                message.success(`${id}号停车场指派成功`)
                return true;
            })
            .catch(error=>{
                console.log(error)
                message.error(`${id}号停车场指派失败`)
                return false;
            })
        }).filter(state=>!state)

        axios.get(`${requestUrls.employees}/id=${userId}`)
        .then(res=>{
            dispatch(actions.updateEmployee(res.data))
        })
        .catch(error=>{
            console.log(error)
        })

        axios.get(requestUrls.parkingLots)
        .then(res => {
            dispatch(actions.allParkingLots(res.data));
        })
        .catch(error => {
            console.log(error);
        });
    },

    "deleteParkinglots":(userId, ids, dispatch) => {
        let path = `${requestUrls.employees}/${userId}/parkinglots/`
        ids.map(id=>{
            axios.delete(`${path}${id}`)
            .then(res=>{
                message.success(`${id}号停车场收回成功`)
            })
            .catch(error=>{
                message.error(`${id}号停车场指派失败`)
            })
        })

        axios.get(`${requestUrls.employees}/id=${userId}`)
        .then(res=>{
            dispatch(actions.updateEmployee(res.data))
        })
        .catch(error=>{
            console.log(error)
        })

        axios.get(requestUrls.parkingLots)
        .then(res => {
            dispatch(actions.allParkingLots(res.data));
        })
        .catch(error => {
            console.log(error);
        });
    },

    "searchOrders":(dispatch, searchValue) => axios.get(requestUrls.orders + "/search?" + searchValue.searchType + "=" + searchValue.searchValue + "")
    .then((res) => {
        dispatch(actions.searchOrders(res.data))
    })
    .catch((error) => {
        console.log(error);
    }),
    "getAllAvailableBoys":(success,id) =>axios.get(requestUrls.employees + "/AvailableParkingBoys" )
        .then(res => {
            success(res.data,id);
        })
        .catch(error => {
            console.log(error);
        }),
    "postOrderToParkingBoy":(id,boyId,dispatch)=>
        axios.patch(requestUrls.orders + "/" + id+"?"+"boyId="+boyId)
            .then(res => {
                dispatch(actions.updateOrderItem(res.data))
            })
            .catch(error => {
                console.log(error);
            }),
    "updateWorkStatus":(parkingBoyId,workStatus,updateParkingBoyList)=>  axios.patch(requestUrls.employees + "/"+parkingBoyId+"/status?state="+workStatus)
        .then(res => {
            updateParkingBoyList(res.data);
        })
        .catch(error => {
            console.log(error);
        }),
}