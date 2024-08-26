/*
  This file helps with our API Dependecy Injection

  This is the "dirty" file that ties concrete implementations together
  and returns the api to be used in Connect/Connections.

  ConnectAPIService is used to get remote data, and this file creates
  the correct/current dataSource(s).
*/

import { FireflyDataSource } from 'src/services/FireflyDataSource'
import { ConnectAPIService } from 'src/services/ConnectAPIService'
import mxAxios from 'src/services/mxAxios'

const api = new ConnectAPIService(new FireflyDataSource(mxAxios))
export default api
