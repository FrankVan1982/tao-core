<?php

namespace oat\tao\test\unit\auth;

use GuzzleHttp\Psr7\Request;
use oat\generis\test\TestCase;
use GuzzleHttp\Client;
use oat\tao\model\auth\BasicType;

/**
 * Class AuthTypeTest
 * @package oat\tao\test\unit\auth
 */
class AuthTypeTest extends TestCase
{

    public function testBasicAuthType()
    {
        $authType = new TestBasicAuthType;
        $credentials = [
            'login' => 'testLogin',
            'password' => 'testPassword'
        ];
        $authType->setCredentials($credentials);

        /** @var Request $requestMock */
        $requestMock = $this->createMock(Request::class);

        $clientMock = $this->createMock(Client::class);

        $clientMock
            ->expects($this->once())
            ->method('send')
            ->with($requestMock, ['auth'=> ['testLogin', 'testPassword'], 'verify' => false]);

        $authType->setClient($clientMock);

        $authType->call($requestMock);
    }

    public function testFailedValidationBasicAuthType()
    {
        $authType = new TestBasicAuthType;
        $credentials = [
            'loginFaild' => 'testLogin',
            'password' => 'testPassword'
        ];
        $authType->setCredentials($credentials);

        /** @var Request $requestMock */
        $requestMock = $this->createMock(Request::class);

        $clientMock = $this->createMock(Client::class);
        $this->expectException(\common_exception_ValidationFailed::class);

        $authType->setClient($clientMock);

        $authType->call($requestMock);
    }
}

class TestBasicAuthType extends BasicType
{
    private $client;

    public function setClient($clientMock)
    {
        $this->client = $clientMock;
    }

    protected function getClient($clientOptions = [])
    {
        return $this->client;
    }
}
