import React, { useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import ROUTES from '../../constants/routes';
import MainLayout from '../../components/MainLayout';
import { QueryClientProvider } from 'react-query';
import { getEthereumNetwork, SUPPORTED_NETWORKS } from 'utils/network';
import snxJSConnector from 'utils/snxJSConnector';
import { useDispatch, useSelector } from 'react-redux';
import { getIsWalletConnected, updateNetworkSettings, updateWallet, getNetworkId } from 'redux/modules/wallet';
import FullScreenMainLayout from 'components/FullScreenMainLayout';
import { ReactQueryDevtools } from 'react-query/devtools';
import { getIsAppReady, setAppReady } from 'redux/modules/app';
import queryConnector from 'utils/queryConnector';
import { Loader } from 'semantic-ui-react';
import { initOnboard } from 'containers/Connector/config';
import { ethers } from 'ethers';
import useLocalStorage from 'hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import onboardConnector from 'utils/onboardConnector';

const OptionsCreateMarket = lazy(() => import('../Options/CreateMarket'));
const Home = lazy(() => import('../Home'));
const OptionsHome = lazy(() => import('../Options/Home'));
const OptionsMarket = lazy(() => import('../Options/Market'));

const App = () => {
    const dispatch = useDispatch();
    const isWalletConnected = useSelector((state) => getIsWalletConnected(state));
    const isAppReady = useSelector((state) => getIsAppReady(state));
    const [selectedWallet, setSelectedWallet] = useLocalStorage(LOCAL_STORAGE_KEYS.SELECTED_WALLET, '');
    const networkId = useSelector((state) => getNetworkId(state));

    queryConnector.setQueryClient();

    useEffect(() => {
        const init = async () => {
            const { networkId, name } = await getEthereumNetwork();
            if (!snxJSConnector.initialized) {
                snxJSConnector.setContractSettings({ networkId });
            }
            dispatch(updateNetworkSettings({ networkId, networkName: name.toLowerCase() }));

            dispatch(setAppReady());
        };

        init();
    }, []);

    useEffect(() => {
        if (isAppReady && networkId) {
            const onboard = initOnboard(networkId, {
                address: (walletAddress) => {
                    dispatch(updateWallet({ walletAddress: walletAddress }));
                },
                network: (networkId) => {
                    if (networkId) {
                        if (onboardConnector.onboard.getState().wallet.provider) {
                            const provider = new ethers.providers.Web3Provider(
                                onboardConnector.onboard.getState().wallet.provider
                            );
                            const signer = provider.getSigner();

                            snxJSConnector.setContractSettings({
                                networkId,
                                provider,
                                signer,
                            });
                        } else {
                            snxJSConnector.setContractSettings({ networkId });
                        }

                        onboardConnector.onboard.config({ networkId });

                        dispatch(
                            updateNetworkSettings({
                                networkId: networkId,
                                networkName: SUPPORTED_NETWORKS[networkId].toLowerCase(),
                            })
                        );
                    }
                },
                wallet: async (wallet) => {
                    if (wallet.provider) {
                        const provider = new ethers.providers.Web3Provider(wallet.provider);
                        const signer = provider.getSigner();
                        const network = await provider.getNetwork();
                        const networkId = network.chainId;

                        snxJSConnector.setContractSettings({
                            networkId,
                            provider,
                            signer,
                        });
                        dispatch(
                            updateNetworkSettings({
                                networkId,
                                networkName: SUPPORTED_NETWORKS[networkId].toLowerCase(),
                            })
                        );
                        setSelectedWallet(wallet.name);
                    } else {
                        setSelectedWallet(null);
                    }
                },
            });
            onboardConnector.setOnBoard(onboard);
        }
    }, [isAppReady]);

    // load previously saved wallet
    useEffect(() => {
        if (onboardConnector.onboard && selectedWallet) {
            onboardConnector.onboard.walletSelect(selectedWallet);
        }
    }, [isAppReady, onboardConnector.onboard, selectedWallet]);

    return (
        <QueryClientProvider client={queryConnector.queryClient}>
            <Suspense fallback={<Loader active />}>
                <Router>
                    <Switch>
                        <Route
                            exact
                            path={ROUTES.Options.CreateMarket}
                            render={() =>
                                isWalletConnected ? (
                                    <FullScreenMainLayout>
                                        <OptionsCreateMarket />
                                    </FullScreenMainLayout>
                                ) : (
                                    <Redirect to={ROUTES.Options.Home} />
                                )
                            }
                        />
                        <Route
                            exact
                            path={ROUTES.Options.MarketMatch}
                            render={(routeProps) => (
                                <FullScreenMainLayout>
                                    <OptionsMarket {...routeProps} />
                                </FullScreenMainLayout>
                            )}
                        />
                        <Route exact path={ROUTES.Options.Home}>
                            <MainLayout>
                                <OptionsHome />
                            </MainLayout>
                        </Route>
                        <Route exact path={ROUTES.Home}>
                            <MainLayout>
                                <Home />
                            </MainLayout>
                        </Route>
                    </Switch>
                </Router>
                <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
        </QueryClientProvider>
    );
};

export default App;
