import onboard from 'bnc-onboard';
import { Subscriptions } from 'bnc-onboard/dist/src/interfaces';
import { getInfuraRpcURL, NetworkId as LocalNetworkId } from 'utils/network';
import browserWalletIcon from 'assets/images/browser-wallet.svg';
import { NetworkId } from '@synthetixio/contracts-interface';

const ledgerIcon =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><path fill="#FFFFFF" d="M399,341.522c0,31.535-25.609,57.1-57.201,57.1H170.2c-31.592,0-57.2-25.564-57.2-57.1V170.222c0-31.533,25.608-57.1,57.2-57.1h171.599c31.592,0,57.201,25.566,57.201,57.1V341.522z"/><g><path fill="#152633" d="M343.266,127.313H224.914v159.661h159.791V168.626c0-22.671-18.652-41.313-41.313-41.313C343.355,127.313,343.303,127.313,343.266,127.313z"/><path fill="#152633" d="M188.018,127.313h-20.396c-22.656,0-41.309,18.656-41.309,41.313v20.396h61.705V127.313z"/><path fill="#152633" d="M126.313,225.919h61.705v61.708h-61.705V225.919z"/><path fill="#152633" d="M323.518,385.706h20.396c22.673,0,41.313-18.653,41.313-41.309c0-0.037,0-0.09,0-0.129v-19.75h-61.709V385.706z"/><path fill="#152633" d="M224.914,324.519h61.707v61.71h-61.707V324.519z"/><path fill="#152633" d="M126.313,324.519v20.4c0,22.651,18.652,41.31,41.309,41.31h20.396v-61.71H126.313z"/></g></svg>';
const trezorIcon =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><path fill="#FFFFFF" d="M346.115,191.927v-9.055v-8v-8.016c0.252-48.768-40.397-88.234-90.113-88.234c-49.917,0-90.314,39.467-90.314,88.234v8.016v8v9.055c-17.531,3.102-35.109,7.234-35.109,12.598v50.879v14.886v53v10.666v50.152c0,0,0,4.772,5.49,7.036c19.896,7.875,98.173,34.941,116.156,41.141c2.316,0.838,2.972,0.838,3.576,0.838c0.855,0,1.259,0,3.576-0.838c17.983-6.199,96.461-33.266,116.357-41.141c5.088-2.065,5.288-6.839,5.288-6.839v-50.35v-10.666v-53v-14.886v-50.879C381.022,199.161,363.695,194.831,346.115,191.927z M221.745,182.095v-5.896v-5.158c0-19.934,12.897-31.926,34.194-31.926c21.334,0,34.229,12.026,34.229,31.926v5.158v5.896v4.766c-23.396-1.216-44.908-1.213-68.424,0.011V182.095z M313.81,340.268c0,1.318-0.154,1.474-1.32,1.939c-1.125,0.505-53.934,19.557-53.934,19.557s-2.134,0.659-2.755,0.659c-0.66,0-2.756-0.814-2.756-0.814s-52.809-19.051-53.934-19.557c-1.125-0.505-1.319-0.659-1.319-1.94v-84.898c-0.311-4.384,26.229-6.675,57.854-6.675s58.164,2.446,58.164,6.831V340.268z"/><path id="path7_2_" fill="#010101" d="M255.985,89.06c-45.767,0-82.805,37.039-82.805,82.806V202.9c-16.072,2.909-32.189,6.789-32.189,11.822v161.963c0,0,0,4.479,5.033,6.604c18.242,7.39,90.01,32.791,106.498,38.609c2.124,0.785,2.725,0.785,3.278,0.785c0.785,0,1.154,0,3.279-0.785c16.487-5.818,88.439-31.22,106.682-38.609c4.665-1.939,4.849-6.418,4.849-6.418V214.723c0-5.033-15.887-9.098-32.004-11.822v-31.035C338.837,126.099,301.567,89.06,255.985,89.06z M255.985,128.639c26.971,0,43.273,16.302,43.273,43.273v26.97c-30.25-2.124-56.066-2.124-86.5,0v-26.97C212.759,144.895,229.062,128.639,255.985,128.639z M255.801,238.599c37.639,0,69.228,2.91,69.228,8.129v101.049c0,1.568-0.184,1.754-1.57,2.308c-1.34,0.601-64.193,23.276-64.193,23.276s-2.54,0.785-3.279,0.785c-0.785,0-3.279-0.97-3.279-0.97s-62.854-22.675-64.193-23.276c-1.34-0.601-1.57-0.786-1.57-2.31V246.542C186.573,241.324,218.162,238.599,255.801,238.599z"/></svg>';
const portisIcon =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <g> <path fill="#FFFFFF" d="M303.852,434.785c-0.224,0.083-0.472,0.188-0.704,0.278c-0.072,0.029-0.142,0.064-0.213,0.092 C303.238,435.034,303.549,434.896,303.852,434.785z"/> <path fill="#FFFFFF" d="M300.767,436.044c-0.703,0.283-1.426,0.56-2.186,0.808c-0.314,0.151-0.641,0.292-0.973,0.425 C298.669,436.878,299.722,436.468,300.767,436.044z"/> <path fill="#FFFFFF" d="M381.476,293.471c-0.561-2.929-1.232-5.844-2.018-8.74l0.069-0.555l-17.345-8.905l15.873-10.056 l-22.531-36.204l-1.978-3.216L256.001,67.247l-97.465,158.694l-5.374,8.748l-19.106,31.271l17.729,9.997l-19.313,8.219l0.004,0.025 c0.002-0.008,0.002-0.016,0.004-0.025l0.129,0.075l-0.123,0.054l-0.031-0.015c-2.512,9.881-3.775,19.964-3.775,30.051 c0.211,39.875,18.584,77.475,50.055,102.678c0.138,0.067,0.271,0.125,0.406,0.19l0.124,0.353c3.419,2.701,6.979,5.223,10.655,7.566 l0.043,0.03l0.01,0.002c5.822,3.706,11.947,6.955,18.328,9.685c1.834,0.614,3.479,1.408,5.119,2.007 c1.039,0.382,2.164,0.835,3.313,1.231c-0.09-0.031-0.17-0.048-0.26-0.077c10.36,3.589,21.294,5.846,32.631,6.492 c0.056,0,0.125,0,0.177,0c0.423,0,1.063,0,1.704,0c0.637,0,1.49,0,2.338,0h5.11c0.639,0,1.915,0,2.343,0c0.426,0,1.063,0,1.701,0 c0.117,0,0.24,0,0.36,0c4.603-0.249,9.173-0.753,13.7-1.521c0.21-0.04,0.42-0.067,0.63-0.136c0.851-0.209,1.274-0.209,2.126-0.414 l1.853-0.327c0.398-0.085,0.8-0.172,1.198-0.259l0.145-0.036c0.638-0.208,1.274-0.208,1.701-0.413 c0.126-0.019,0.233-0.055,0.357-0.076c1.019-0.282,2.004-0.535,2.939-0.738c0.689-0.185,1.379-0.378,2.065-0.578l1.448-0.474 c0.642-0.203,1.492-0.41,2.13-0.619c0.031-0.01,0.062-0.021,0.091-0.03c0.789-0.264,1.559-0.559,2.34-0.841 c-0.811,0.259-1.631,0.497-2.459,0.675c1.896-0.617,3.584-1.237,5.48-1.858c1.463-0.535,3.062-1.211,4.566-1.788 c5.558-2.359,10.922-5.051,16.059-8.141c0.002-0.002,0.002-0.002,0.007-0.002c0.104-0.064,0.204-0.134,0.31-0.195 c0.571-0.52,1.158-0.91,1.918-1.281l0.418-0.197c0.006-0.006,0.012-0.008,0.016-0.012c0.637-0.617,1.274-0.827,2.12-1.449 c0.64-0.619,1.493-1.242,2.345-1.654c0.85-0.416,1.49-1.035,2.339-1.656l1.052-0.819c0.377-0.259,0.754-0.522,1.077-0.835 l0.004-0.005l1.972-1.531c0.195-0.092,0.383-0.17,0.58-0.267c31.408-25.203,49.75-62.803,49.959-102.678 C383.321,307.358,382.677,300.383,381.476,293.471z M379.323,284.208l-0.089,0.016l0.081-0.048 C379.318,284.188,379.32,284.196,379.323,284.208z M223.747,440.16c1.477,0.413,2.74,0.825,4.217,1.032 C226.487,440.985,225.011,440.573,223.747,440.16z M332.938,417.163l0.007-0.014c0.141-0.067,0.277-0.127,0.418-0.195 L332.938,417.163z"/> </g> <path fill="#143444" d="M255.906,352.932l110.625-65.509c0.01,0.033,0.017,0.066,0.024,0.1l0.166-0.1l-24.367-10.603l-86.463,51.076 l-6.24-3.745l-9.079-5.334l-47.596-28.212l-23.409-13.822l-16.184,7.047l-8.323,3.593l0.003,0.023 c0.002-0.009,0.002-0.016,0.003-0.023L255.906,352.932z"/> <polygon fill="#1E435A" points="255.892,216.689 255.892,239.195 255.892,327.708 255.892,327.896 342.354,276.82 362.183,265.106 "/> <polygon fill="#4C6C9B" points="345.187,236.923 343.412,233.979 255.892,88.837 255.892,193.335 255.892,200.046 255.892,200.13 255.892,216.689 362.183,265.106 "/> <polygon fill="#3F5679" points="240.761,223.687 197.854,243.175 149.969,265.025 162.084,272.293 169.619,276.76 192.977,290.605 240.761,318.817 255.703,327.598 255.703,239.278 255.703,216.776 "/> <polygon fill="#6EB3D9" points="168.446,234.112 163.624,242.121 149.874,264.968 149.907,264.987 149.978,264.917 197.854,243.175 240.572,223.68 240.572,223.497 255.703,216.689 255.703,216.775 255.892,216.689 255.892,200.13 255.798,200.089 255.892,200.046 255.892,193.335 255.892,88.837 "/> <path fill="#6EB3D9" d="M256,352.987l-0.094-0.056l-0.203,0.119l-110.631-65.51l-0.027-0.015c-2.254,9.047-3.388,18.277-3.388,27.51 c0.188,36.503,16.674,70.924,44.91,93.997c10.848,5.414,20.044,6.943,27.836,5.836c7.585-1.134,13.853-4.729,19.028-9.646 c5.929-5.7,10.391-13.192,13.728-20.732c0.341-0.771,0.674-1.543,0.992-2.314c3.713-9.263,6.319-18.715,7.849-28.521 c-0.031-0.202-0.078-0.402-0.108-0.604L256,352.987z"/> <g> <path fill="#539CBA" d="M298.825,425.297c-0.202,0.076-0.424,0.173-0.633,0.254c-0.064,0.027-0.126,0.06-0.19,0.085 C298.274,425.525,298.553,425.398,298.825,425.297z"/> <path fill="#539CBA" d="M297.316,414.701c-11.57-1.686-19.994-9.12-25.919-18.237c-3.049-4.509-5.543-9.432-7.563-14.288 c-0.005-0.014-0.009-0.025-0.015-0.04c-3.611-8.857-6.159-18.236-7.696-27.801c-1.559,9.601-4.136,19.019-7.791,27.909 c-0.31,0.739-0.632,1.477-0.963,2.216c-3.374,7.531-7.913,15.041-13.938,20.763c-5.156,4.959-11.419,8.563-19.028,9.646 c-7.697,1.15-16.749-0.25-27.36-5.339c7.94,6.396,16.693,11.736,26.051,15.821c1.646,0.563,3.122,1.289,4.594,1.837 c0.933,0.351,1.941,0.765,2.972,1.127c-0.08-0.026-0.152-0.043-0.233-0.07c9.296,3.285,19.105,5.351,29.277,5.943 c0.05,0,0.112,0,0.158,0c0.38,0,0.955,0,1.528,0c0.571,0,1.337,0,2.099,0h4.585c0.572,0,1.719,0,2.102,0s0.954,0,1.526,0 c0.104,0,0.216,0,0.323,0c4.13-0.229,8.229-0.689,12.292-1.393c0.188-0.036,0.377-0.062,0.565-0.125 c0.763-0.19,1.145-0.19,1.908-0.378l1.661-0.3c0.358-0.077,0.717-0.157,1.075-0.237l0.13-0.033c0.572-0.19,1.144-0.19,1.526-0.378 c0.112-0.017,0.209-0.05,0.321-0.068c0.913-0.261,1.797-0.491,2.638-0.677c0.618-0.17,1.235-0.347,1.853-0.529l1.299-0.434 c0.576-0.186,1.339-0.376,1.911-0.566c0.027-0.01,0.055-0.02,0.082-0.028c0.707-0.242,1.397-0.513,2.099-0.77 c-0.727,0.237-1.464,0.454-2.206,0.618c1.7-0.566,3.215-1.134,4.916-1.702c1.313-0.489,2.748-1.108,4.098-1.638 c4.986-2.159,9.8-4.623,14.408-7.45c0.002-0.002,0.002-0.002,0.006-0.002c0.094-0.06,0.184-0.123,0.278-0.18 c0.513-0.475,1.039-0.832,1.721-1.174l0.375-0.181c0.005-0.005,0.01-0.007,0.014-0.01c0.571-0.566,1.144-0.757,1.902-1.326 c0.573-0.566,1.339-1.137,2.104-1.515c0.762-0.381,1.337-0.948,2.099-1.517c0.575-0.567,1.338-0.948,1.91-1.515l0.193-0.193 c0.521-0.344,1.042-0.832,1.565-1.207C314.101,414.485,305.022,415.89,297.316,414.701z M226.954,430.218 c1.324,0.377,2.459,0.755,3.783,0.945C229.413,430.973,228.088,430.595,226.954,430.218z"/> <path fill="#539CBA" d="M292.265,427.95c1.939-0.724,3.85-1.5,5.737-2.314c-1.247,0.513-2.509,1.09-3.907,1.553 C293.515,427.478,292.889,427.715,292.265,427.95z"/> </g> <path fill="#4C6C9B" d="M368.469,295.933c-0.518-2.764-1.138-5.518-1.871-8.25c-0.014-0.055-0.026-0.108-0.042-0.16L256,352.987 l0.109,0.063c-0.03,0.205-0.077,0.402-0.109,0.604c0.036,0.229,0.087,0.451,0.123,0.68c1.537,9.564,4.085,18.943,7.696,27.801 l0.491-0.067c0.023,0.058,0.042,0.116,0.065,0.176c1.781,4.826,4.101,9.726,7.021,14.22c6.137,9.084,14.534,16.48,25.919,18.237 c7.827,1.139,17.089-0.35,27.985-5.727l-0.381,0.19c-0.051,0.033-0.102,0.082-0.153,0.117c0.18-0.086,0.353-0.159,0.534-0.249 c28.181-23.073,44.636-57.494,44.823-93.997C370.125,308.646,369.547,302.26,368.469,295.933z"/> </svg>';
const walletConnectIcon =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <path fill="#FFFFFF" d="M378.856,220.17l-1.389-1.544l-5.386-5.988c-69.253-70.373-168.323-67.643-231.193,0l-6.47,7.193 l-1.963,2.184c-0.179,0.2-0.341,0.411-0.501,0.622c-0.646,1.194-1.013,2.561-1.013,4.014c0,2.234,0.874,4.261,2.291,5.771 l0.384,0.385l27.723,27.723l2.107,2.108c0.166,0.113,0.337,0.22,0.51,0.321c0.947,0.468,2.12,0.87,3.289,1.127 c0.336,0.041,0.676,0.067,1.023,0.067c1.851,0,3.557-0.603,4.949-1.612l1.344-1.215l4.253-3.844 c48.31-47.784,106.433-50.7,150.968-1.182l3.949,4.253l1.834,1.974c1.434,1.125,3.236,1.801,5.2,1.801 c2.245,0,4.28-0.881,5.793-2.311l0.345-0.344l29.586-29.586l2.533-2.535c0.849-1.317,1.348-2.881,1.348-4.565 C380.371,223.195,379.809,221.537,378.856,220.17z"/> <path fill="#FFFFFF" d="M442.063,281.312l-32.939-33.714c-2.416-2.471-5.864-3.021-7.703-1.227l-71.043,69.416l-70.372-68.781 c-0.861-0.842-2.095-1.136-3.41-0.957c-1.184-0.068-2.285,0.244-3.081,1.021l-71.472,69.835l-71.456-69.84 c-1.836-1.794-5.283-1.249-7.702,1.223l-32.946,33.708c-2.414,2.469-2.884,5.932-1.046,7.729l94.017,91.892l14.312,14.647 c0.954,0.977,2.069,1.641,3.185,1.99c0.518,0.196,1.08,0.289,1.674,0.272c0.208,0.002,0.406-0.015,0.605-0.038 c0.059-0.008,0.116-0.016,0.175-0.025c0.257-0.04,0.501-0.101,0.738-0.186c1.138-0.344,2.28-1.011,3.257-2.008l14.536-14.871 l55.397-54.127l35.834,35.025l32.504,33.269c2.414,2.471,5.865,3.021,7.703,1.225l110.279-107.751 C444.946,287.246,444.478,283.788,442.063,281.312z"/> <g id="Page-1_2_"> <g id="walletconnect-logo-alt_2_"> <path id="WalletConnect_2_" fill="#5A91CC" d="M151.293,211.893c57.639-56.432,151.089-56.432,208.727,0l6.938,6.793 c2.881,2.821,2.881,7.396,0,10.218l-23.73,23.233c-1.44,1.411-3.776,1.411-5.219,0l-9.545-9.347 c-40.209-39.37-105.402-39.37-145.613,0l-10.222,10.01c-1.44,1.41-3.777,1.41-5.218,0l-23.73-23.233 c-2.883-2.822-2.883-7.397,0-10.219L151.293,211.893z M409.094,259.942l21.121,20.678c2.881,2.82,2.881,7.396,0,10.218 l-95.229,93.238c-2.882,2.822-7.554,2.822-10.435,0l0,0l-67.589-66.174c-0.721-0.706-1.888-0.706-2.608,0l0,0l-67.587,66.174 c-2.882,2.822-7.554,2.822-10.437,0l0,0L81.1,290.835c-2.883-2.82-2.883-7.395,0-10.216l21.119-20.678 c2.881-2.822,7.555-2.822,10.436,0l67.59,66.175c0.72,0.705,1.889,0.705,2.609,0l0,0l67.584-66.175 c2.883-2.822,7.555-2.822,10.436,0l0,0l67.59,66.175c0.72,0.705,1.889,0.705,2.607,0l67.588-66.174 C401.541,257.121,406.213,257.121,409.094,259.942z"/> </g> </g> </svg>';
const authereumIcon =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <path fill="#FFFFFF" d="M411.099,189.412l-0.224-68.297l-53.064-16.527c-29.123-9.037-95.766-28.498-95.913-28.379 c-0.046-0.477-43.643,11.999-86.439,25.527c-23.421,7.465-46.99,14.826-52.546,16.526l-9.912,3.17v68.129 c0,40.79,0.312,71.536,0.782,76.646c3.441,35.682,19.044,69.519,45.121,97.647c5.947,6.405,100.096,87.604,102.751,88.604 c1.104,0.383,83.857-69.447,97.44-82.271c23.587-22.177,42.015-54.621,48.576-85.677 C411.099,268.084,411.338,262.111,411.099,189.412z"/> <g> <path fill="#F0523E" d="M181.162,110.222c-21.831,7.031-43.8,13.966-48.978,15.567l-9.239,2.986v64.181 c0,38.425,0.29,67.391,0.729,72.202c3.207,33.613,17.75,65.489,42.057,91.988c5.543,6.034,93.299,82.527,95.773,83.469 c1.029,0.361,78.162-65.422,90.824-77.502c21.984-20.892,39.16-51.456,45.276-80.712c3.194-15.475,3.418-21.101,3.194-89.586 l-0.208-64.339l-49.461-15.568c-27.146-8.514-49.496-15.475-49.634-15.361c-0.141,0.114,4.008,8.231,9.17,18.06l9.381,17.82 l14.065,4.518c7.707,2.476,19.355,6.192,25.912,8.227l11.856,3.701l-0.299,59.077c-0.209,56.756-0.279,59.384-1.744,65.996 c-5.123,24.212-17.098,46.438-34.485,64.043c-3.347,3.43-20.381,18.495-37.769,33.404c-17.389,14.913-32.505,28.05-33.66,29.075 l-1.886,1.744l-33.279-28.753c-40.789-35.16-46.938-41.183-56.7-56.178c-7.421-11.338-12.972-23.792-16.441-36.894 c-3.279-13.109-3.559-17.974-3.559-76.351v-55.079l10.406-3.276c5.626-1.831,17.317-5.531,25.826-8.23 c5.245-1.536,10.411-3.335,15.471-5.386c0-0.212,4.082-8.218,9.103-17.753c5.025-9.534,9.103-17.541,9.103-17.683 C221.925,97.182,221.053,97.477,181.162,110.222z"/> <path fill="#F0523E" d="M260.059,99.744c-0.663,1.303-19.006,36.299-40.68,77.714l-39.454,75.318l0.589,6.12 c1.596,13.451,6.223,26.364,13.53,37.77c2.687,4.373,3.488,5.174,4.219,4.373c0.44-0.523,14.858-27.74,32.03-60.484 c17.176-32.744,31.282-59.459,31.581-59.459c0.291,0,14.626,26.486,31.955,58.811c17.328,32.324,31.806,59.305,32.238,60.036 c0.718,1.237,0.872,1.167,2.026-0.369c7.496-9.845,13.687-26.046,15.471-40.382l0.872-7.287l-41.324-77.063 c-22.719-42.354-41.411-77.212-41.563-77.295C261.395,97.465,260.79,98.349,260.059,99.744z"/> <path fill="#F0523E" d="M241.571,285.1l-20.012,39.946l11.251,9.849c6.191,5.37,15.274,13.165,20.157,17.242l8.946,7.43 l2.011-1.604c1.166-0.872,10.112-8.663,19.945-17.329l18.032-15.726l-19.945-39.891c-10.984-21.901-20.016-39.878-20.154-39.878 C261.662,245.14,252.56,263.116,241.571,285.1z"/> </g> </svg>';
const walletLinkIcon =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <circle fill="#FFFFFF" cx="256" cy="256" r="175"/> <g> <path fill="#4364AE" d="M255.8,92.757c-90.156,0-163.243,73.086-163.243,163.243S165.644,419.243,255.8,419.243 S419.043,346.157,419.043,256S345.956,92.757,255.8,92.757z M255.8,351.666c-52.836,0-95.666-42.831-95.666-95.666 s42.83-95.666,95.666-95.666s95.666,42.831,95.666,95.666S308.636,351.666,255.8,351.666z"/> <path fill="#4364AE" d="M281.998,226.116h-52.396c-2.618,0-4.739,2.121-4.739,4.738v50.289c0,2.618,2.121,4.74,4.739,4.74h52.396 c2.617,0,4.739-2.122,4.739-4.74v-50.289C286.737,228.237,284.615,226.116,281.998,226.116z"/> </g> </svg>';
const latticeIcon =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <path fill="#FFFFFF" d="M351.431,98.828H146.604c-37.708,0-68.275,30.5-68.275,68.127V371.33c0,37.626,30.567,68.126,68.275,68.126 h204.827c37.707,0,68.275-30.5,68.275-68.126V166.955C419.706,129.328,389.138,98.828,351.431,98.828z"/> <g> <path fill="#010101" d="M219.528,245.457h-12.07v26.621h12.07c4.474,0,7.859-1.168,10.152-3.502c2.3-2.332,3.459-5.604,3.48-9.809 c0-4.348-1.159-7.637-3.48-9.877C227.37,246.61,223.986,245.464,219.528,245.457z"/> <path fill="#010101" d="M343.038,109.084H151.111c-35.333,0-63.976,28.643-63.976,63.977v191.926 c0,35.334,28.643,63.977,63.976,63.977h191.927c35.333,0,63.976-28.643,63.976-63.977V173.061 C407.014,137.727,378.371,109.084,343.038,109.084z M129.369,281.832c3.59,7.371,11.146,11.982,19.349,11.797 c4.324,0.061,8.578-1.07,12.302-3.264l0.025-22.359h14.45v30.969c-3.813,3.186-8.188,5.629-12.897,7.203 c-4.749,1.646-9.737,2.492-14.764,2.506c-6.731,0.1-13.357-1.652-19.158-5.066c-5.66-3.375-10.277-8.242-13.345-14.07 c-6.457-12.795-6.457-27.896,0-40.691c3.08-5.841,7.729-10.714,13.42-14.068c5.876-3.412,12.57-5.164,19.361-5.067 c5.623-0.081,11.195,1.062,16.331,3.354c4.839,2.225,9.063,5.596,12.302,9.822l-10.134,10.471 c-4.892-5.742-10.79-8.615-17.693-8.615c-4.086-0.072-8.109,0.983-11.633,3.055c-3.405,2.055-6.153,5.045-7.916,8.613 c-1.949,3.963-2.924,8.342-2.843,12.76C126.452,273.563,127.423,277.902,129.369,281.832z M232.602,307.375l-12.704-21.252h-14.025 v21.252h-15.245v-76.381h28.486c5.267-0.131,10.486,1.019,15.21,3.355c4.183,2.148,7.635,5.491,9.921,9.596 c2.418,4.529,3.62,9.604,3.489,14.732c0.141,5.113-1.077,10.174-3.533,14.662c-2.33,4.09-5.835,7.379-10.064,9.441l14.772,24.541 L232.602,307.375z M281.442,307.34h-16.774v-76.346h16.774V307.34z M364.511,289.266c-3.092,5.654-7.753,10.297-13.42,13.367 c-6.125,3.258-12.982,4.889-19.92,4.742h-31.385v-76.344h31.406c1.243,0,2.462,0.054,3.658,0.145v14.693 c-1.48-0.221-2.977-0.334-4.474-0.334h-14.606v47.336h14.606c6.907,0.006,12.414-2.119,16.531-6.379 c4.114-4.256,6.173-10.021,6.173-17.287c0-1.01-0.044-1.971-0.122-2.922h16.263c0.078,0.959,0.078,1.934,0.078,2.922 C369.456,276.189,367.807,283.102,364.511,289.266z M385.146,246.22H369.3v16.483h-14.441V246.22h-15.947v-14.542h15.947v-16.54 H369.3v16.493h15.847V246.22z"/> <path fill="#FFFFFF" d="M137.285,247.807c3.523-2.071,7.547-3.127,11.633-3.055c6.903,0,12.802,2.873,17.693,8.615l10.134-10.471 c-3.239-4.227-7.463-7.598-12.302-9.822c-5.136-2.293-10.708-3.436-16.331-3.354c-6.791-0.097-13.485,1.655-19.361,5.067 c-5.691,3.354-10.34,8.228-13.42,14.068c-6.457,12.795-6.457,27.896,0,40.691c3.067,5.828,7.685,10.695,13.345,14.07 c5.801,3.414,12.427,5.166,19.158,5.066c5.026-0.014,10.015-0.859,14.764-2.506c4.71-1.574,9.084-4.018,12.897-7.203v-30.969 h-14.45l-0.025,22.359c-3.724,2.193-7.978,3.324-12.302,3.264c-8.203,0.186-15.759-4.426-19.349-11.797 c-1.946-3.93-2.917-8.27-2.843-12.652c-0.081-4.418,0.894-8.797,2.843-12.76C131.132,252.852,133.88,249.861,137.285,247.807z"/> <path fill="#FFFFFF" d="M244.2,273.34c2.456-4.488,3.674-9.549,3.533-14.662c0.131-5.129-1.071-10.203-3.489-14.732 c-2.286-4.104-5.738-7.447-9.921-9.596c-4.724-2.337-9.943-3.486-15.21-3.355h-28.486v76.381h15.245v-21.252h14.025l12.704,21.252 l16.307-0.053l-14.772-24.541C238.365,280.719,241.87,277.43,244.2,273.34z M229.681,268.576 c-2.293,2.334-5.679,3.502-10.152,3.502h-12.07v-26.621h12.07c4.458,0.007,7.842,1.153,10.152,3.434 c2.321,2.24,3.48,5.529,3.48,9.877C233.14,262.973,231.98,266.244,229.681,268.576z"/> <rect x="264.668" y="230.994" fill="#FFFFFF" width="16.774" height="76.346"/> <polygon fill="#5AB6E4" points="369.3,215.138 354.858,215.138 354.858,231.678 338.911,231.678 338.911,246.22 354.858,246.22 354.858,262.703 369.3,262.703 369.3,246.22 385.146,246.22 385.146,231.631 369.3,231.631 	"/> <path fill="#FFFFFF" d="M352.959,266.283c0.078,0.951,0.122,1.912,0.122,2.922c0,7.266-2.059,13.031-6.173,17.287 c-4.117,4.26-9.624,6.385-16.531,6.379h-14.606v-47.336h14.606c1.497,0,2.993,0.113,4.474,0.334v-14.693 c-1.196-0.091-2.415-0.145-3.658-0.145h-31.406v76.344h31.385c6.938,0.146,13.795-1.484,19.92-4.742 c5.667-3.07,10.328-7.713,13.42-13.367c3.296-6.164,4.945-13.076,4.789-20.061c0-0.988,0-1.963-0.078-2.922H352.959z"/> </g> </svg>';
const torusIcon =
    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <path fill="#FFFFFF" d="M364.55,100.266H159.723c-37.708,0-68.275,30.5-68.275,68.126v204.374c0,37.627,30.567,68.127,68.275,68.127 H364.55c37.707,0,68.275-30.5,68.275-68.127V168.392C432.825,130.766,402.257,100.266,364.55,100.266z"/> <g> <path fill="#3D5BA9" d="M358.342,111.736H165.93c-35.422,0-64.136,28.715-64.136,64.137v192.412 c0,35.422,28.714,64.136,64.136,64.136h192.412c35.422,0,64.136-28.714,64.136-64.136V175.873 C422.478,140.451,393.764,111.736,358.342,111.736z M281.195,373.589c-0.022,12.083-9.836,21.854-21.918,21.828h-24.209 c-12.16,0.132-22.125-9.614-22.268-21.772V231.712h-39.404c-12.158,0.131-22.125-9.614-22.268-21.773v-25.914 c0.025-12.082,9.842-21.855,21.924-21.83h86.225c12.082-0.025,21.896,9.748,21.918,21.83V373.589z M333.426,231.208 c-19.078,0.035-34.574-15.399-34.61-34.479c0-18.989,15.35-34.404,34.341-34.479c19.044-0.074,34.543,15.302,34.614,34.343 C367.846,215.637,352.469,231.133,333.426,231.208z"/> <path fill="#FFFFFF" d="M259.277,162.194h-86.225c-12.082-0.025-21.898,9.748-21.924,21.83v25.914 c0.143,12.159,10.109,21.904,22.268,21.773h39.404v141.933c0.143,12.158,10.107,21.904,22.268,21.772h24.209 c12.082,0.025,21.896-9.745,21.918-21.828V184.024C281.173,171.942,271.359,162.169,259.277,162.194z"/> <path fill="#FFFFFF" d="M333.156,162.25c-18.991,0.074-34.341,15.489-34.341,34.479c0.036,19.08,15.532,34.515,34.61,34.479 c19.043-0.075,34.42-15.571,34.345-34.615C367.699,177.552,352.2,162.176,333.156,162.25z"/> </g> </svg>';

export const initOnboard = (networkId: LocalNetworkId, subscriptions: Subscriptions) => {
    const infuraRpc = getInfuraRpcURL(networkId);

    return onboard({
        hideBranding: true,
        networkId,
        subscriptions,
        darkMode: true,
        walletSelect: {
            wallets: [
                {
                    name: 'Browser Wallet',
                    iconSrc: browserWalletIcon,
                    type: 'injected',
                    link: 'https://metamask.io',
                    wallet: async (helpers) => {
                        const { createModernProviderInterface } = helpers;
                        const provider = window.ethereum;
                        return {
                            provider,
                            interface: provider ? createModernProviderInterface(provider) : null,
                        };
                    },
                    preferred: true,
                    desktop: true,
                    mobile: true,
                },
                { walletName: 'tally', preferred: true },
                {
                    walletName: 'ledger',
                    rpcUrl: infuraRpc,
                    preferred: true,
                    svg: ledgerIcon,
                },
                {
                    walletName: 'lattice',
                    appName: 'Thales',
                    rpcUrl: infuraRpc,
                    preferred: true,
                    svg: latticeIcon,
                },
                {
                    walletName: 'trezor',
                    appUrl: 'https://thales.markets',
                    email: 'info@thales.markets',
                    rpcUrl: infuraRpc,
                    preferred: true,
                    svg: trezorIcon,
                },
                {
                    walletName: 'walletConnect',
                    rpc: {
                        [NetworkId.Mainnet]: getInfuraRpcURL(NetworkId.Mainnet),
                        [NetworkId['Mainnet-Ovm']]: getInfuraRpcURL(NetworkId['Mainnet-Ovm']),
                        [NetworkId.Kovan]: getInfuraRpcURL(NetworkId.Kovan),
                        [NetworkId['Kovan-Ovm']]: getInfuraRpcURL(NetworkId['Kovan-Ovm']),
                    },
                    preferred: true,
                    svg: walletConnectIcon,
                },
                { walletName: 'coinbase', preferred: true },
                {
                    walletName: 'portis',
                    apiKey: process.env.REACT_APP_PORTIS_APP_ID,
                    preferred: true,
                    svg: portisIcon,
                },
                { walletName: 'trust', rpcUrl: infuraRpc, preferred: true },
                { walletName: 'walletLink', rpcUrl: infuraRpc, preferred: true, svg: walletLinkIcon },
                {
                    walletName: 'torus',
                    preferred: true,
                    svg: torusIcon,
                },
                { walletName: 'status', preferred: true },
                { walletName: 'authereum', preferred: true, svg: authereumIcon },
                { walletName: 'imToken', preferred: true },
            ],
        },
        walletCheck: [{ checkName: 'derivationPath' }, { checkName: 'accounts' }, { checkName: 'connect' }],
    });
};
