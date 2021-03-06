import axios from 'axios';
import { TEST, APIURL } from './types';
const electron = window.require("electron");

//Tets de newUserForm
export const test = () => async (dispatch, getState) => {
  const res =  getState().form.newUserForm.values.test;
    if(res){
      console.log(res);
    }
    dispatch({ type: TEST, payload: 'test' });
};

//Tets URL de la API que no requiere token
export const testOpen = () => async (dispatch, getState) => {
    const res = await axios.get(`${getState().apiUrl}api/testOpen`);
    console.log(res);
    dispatch({ type: TEST, payload: 'test' });
};

//Test URL de la API que si requiere token y se ocupara para probar que respuesta negativa
export const testCloseFail = () => async (dispatch, getState) => {
    const res = await axios.get(`${getState().apiUrl}api/testClose`);
    console.log(res);
    dispatch({ type: TEST, payload: 'test' });
};

//Test URL de la API que si requiere token y se ocupara para probar el acceso positivo
export const testCloseOk = () => async (dispatch, getState) => {
    new Promise(resolve => {
        electron.ipcRenderer.send('getToken', 'getToken')
        electron.ipcRenderer.on('getToken', (event, result) => {
            resolve(result);
        })
    }).then( async function(token){
      //Si tenemos el token guardado, enviamos la peticion a la API de test
      try {
        await axios.get(`${getState().apiUrl}api/testClose`, { headers: { auth: token } });
        dispatch({ type: TEST, payload: 'test' });
      } catch (err) {
        console.log(err);
      }
    }).catch(function(err){
      console.log(err);
    });
};

//Consulta a electron por la URL de la API
export const checkApiUrl= () => async dispatch => {
  //Pregunndo por la URL de la API
  new Promise(resolve => {
      electron.ipcRenderer.send('getApiUrl')
      electron.ipcRenderer.on('getApiUrl', (event, result) => {
          resolve(result);
      })
  }).then(function(apiUrl){
      dispatch({ type: APIURL, payload: apiUrl });
  }).catch(function(err){
    console.log(err);
  });
};
