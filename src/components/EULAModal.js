import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const EULAModal = ({ visible, onAccept, onReject }) => {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const scrollViewRef = useRef(null);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isCloseToEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isCloseToEnd && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  const handleAccept = () => {
    if (!hasScrolledToEnd) {
      Alert.alert(
        'Leitura Obrigatória',
        'Por favor, leia todo o Termo de Uso até o final antes de aceitar.',
        [{ text: 'OK' }]
      );
      return;
    }
    onAccept();
  };

  const eulaText = `TERMO DE USO E LICENÇA DO USUÁRIO FINAL (EULA)
APLICATIVO CIRCULA BEM

Última atualização: ${new Date().toLocaleDateString('pt-BR')}

IMPORTANTE: LEIA ESTE TERMO DE USO CUIDADOSAMENTE ANTES DE USAR O APLICATIVO CIRCULA BEM. AO ACESSAR OU USAR NOSSO APLICATIVO, VOCÊ CONCORDA EM FICAR VINCULADO AOS TERMOS E CONDIÇÕES ESTABELECIDOS NESTE DOCUMENTO.

1. DEFINIÇÕES

1.1. "Aplicativo" refere-se ao software Circula Bem e todos os seus componentes.
1.2. "Usuário" refere-se a qualquer pessoa que acessa ou utiliza o Aplicativo.
1.3. "Serviços" refere-se às funcionalidades oferecidas pelo Aplicativo.
1.4. "Conteúdo" refere-se a textos, imagens, dados e outras informações disponibilizadas através do Aplicativo.

2. ACEITE DOS TERMOS

2.1. Este Termo de Uso constitui um acordo legal entre você e a empresa desenvolvedora do Circula Bem.
2.2. Ao usar o Aplicativo, você declara ter lido, compreendido e concordado com todos os termos aqui estabelecidos.
2.3. Se você não concordar com qualquer parte deste Termo, não deverá usar o Aplicativo.

3. DESCRIÇÃO DO SERVIÇO

3.1. O Circula Bem é uma plataforma digital que facilita o compartilhamento e aluguel de itens entre usuários.
3.2. O Aplicativo permite que usuários cadastrem produtos para aluguel, busquem itens disponíveis e realizem transações de aluguel.
3.3. A plataforma também oferece funcionalidades de grupos para facilitar o compartilhamento em comunidades específicas.

4. CADASTRO E CONTA DO USUÁRIO

4.1. Para usar os Serviços, você deve criar uma conta fornecendo informações verdadeiras, atuais e completas.
4.2. Você é responsável por manter a confidencialidade de suas credenciais de acesso.
4.3. Você deve notificar imediatamente sobre qualquer uso não autorizado de sua conta.
4.4. É proibido criar múltiplas contas ou usar contas de terceiros.

5. USO ACEITÁVEL

5.1. Você concorda em usar o Aplicativo apenas para fins legais e de acordo com este Termo.
5.2. É proibido:
   a) Violar qualquer lei local, estadual, nacional ou internacional;
   b) Transmitir conteúdo ofensivo, difamatório, obsceno ou prejudicial;
   c) Interferir ou perturbar a operação do Aplicativo;
   d) Tentar obter acesso não autorizado a sistemas ou dados;
   e) Usar o Aplicativo para fins comerciais não autorizados;
   f) Cadastrar produtos falsificados, roubados ou ilegais;
   g) Fornecer informações falsas ou enganosas.

6. CONTEÚDO DO USUÁRIO

6.1. Você mantém a propriedade de todo conteúdo que enviar ao Aplicativo.
6.2. Ao enviar conteúdo, você nos concede uma licença mundial, não exclusiva, livre de royalties para usar, reproduzir e exibir esse conteúdo.
6.3. Você declara que possui todos os direitos necessários sobre o conteúdo enviado.
6.4. Reservamo-nos o direito de remover conteúdo que viole este Termo.

7. TRANSAÇÕES E PAGAMENTOS

7.1. O Aplicativo facilita transações entre usuários, mas não é parte das transações.
7.2. Usuários são responsáveis por cumprir os acordos de aluguel estabelecidos.
7.3. Disputas entre usuários devem ser resolvidas diretamente entre as partes.
7.4. Não garantimos a qualidade, segurança ou legalidade dos itens listados.

8. PRIVACIDADE E PROTEÇÃO DE DADOS

8.1. Coletamos e processamos dados pessoais conforme nossa Política de Privacidade.
8.2. Implementamos medidas de segurança para proteger seus dados.
8.3. Você consente com o processamento de seus dados conforme descrito na Política de Privacidade.
8.4. Seus dados podem ser compartilhados com outros usuários conforme necessário para as transações.

9. PROPRIEDADE INTELECTUAL

9.1. O Aplicativo e todo seu conteúdo são protegidos por direitos autorais e outras leis de propriedade intelectual.
9.2. É proibido copiar, modificar, distribuir ou criar obras derivadas do Aplicativo.
9.3. Todas as marcas registradas são propriedade de seus respectivos donos.

10. LIMITAÇÃO DE RESPONSABILIDADE

10.1. O Aplicativo é fornecido "como está" sem garantias de qualquer tipo.
10.2. Não somos responsáveis por:
   a) Danos diretos ou indiretos resultantes do uso do Aplicativo;
   b) Perda de dados ou lucros;
   c) Interrupções no serviço;
   d) Ações de outros usuários;
   e) Qualidade ou segurança dos itens alugados.

11. INDENIZAÇÃO

11.1. Você concorda em indenizar e isentar a empresa de quaisquer reivindicações, danos ou despesas resultantes de:
   a) Seu uso do Aplicativo;
   b) Violação deste Termo;
   c) Violação de direitos de terceiros;
   d) Suas transações com outros usuários.

12. SUSPENSÃO E ENCERRAMENTO

12.1. Podemos suspender ou encerrar sua conta a qualquer momento por violação deste Termo.
12.2. Você pode encerrar sua conta a qualquer momento.
12.3. Após o encerramento, algumas disposições deste Termo continuarão em vigor.

13. MODIFICAÇÕES DO TERMO

13.1. Reservamos o direito de modificar este Termo a qualquer momento.
13.2. Mudanças significativas serão notificadas com antecedência razoável.
13.3. O uso continuado do Aplicativo após as modificações constitui aceite dos novos termos.

14. RESOLUÇÃO DE DISPUTAS

14.1. Disputas serão resolvidas preferencialmente por mediação.
14.2. Se necessário, disputas serão submetidas aos tribunais brasileiros.
14.3. A lei brasileira governa este Termo.

15. DISPOSIÇÕES GERAIS

15.1. Se qualquer disposição deste Termo for considerada inválida, as demais permanecem em vigor.
15.2. Este Termo constitui o acordo completo entre as partes.
15.3. A falha em exercer qualquer direito não constitui renúncia.

16. CONTATO

Para questões sobre este Termo de Uso, entre em contato:
- Email: contato@circulabem.com.br
- Telefone: (11) 1234-5678

17. CONSENTIMENTO ESPECÍFICO

Ao aceitar este Termo, você especificamente consente com:
- O processamento de seus dados pessoais;
- O compartilhamento de informações necessárias para transações;
- O recebimento de comunicações relacionadas ao serviço;
- A aplicação das regras e políticas do Circula Bem.

DECLARO QUE LI E COMPREENDI TODOS OS TERMOS ACIMA E CONCORDO EM FICAR VINCULADO A ELES.`;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onReject}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Termo de Uso e Licença</Text>
            <TouchableOpacity onPress={onReject} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.eulaText}>{eulaText}</Text>
            
            {hasScrolledToEnd && (
              <View style={styles.endMarker}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={24} 
                  color="#4CAF50" 
                />
                <Text style={styles.endText}>
                  Você leu todo o termo. Agora pode aceitar ou rejeitar.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <Text style={styles.rejectButtonText}>Rejeitar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.acceptButton, 
                !hasScrolledToEnd && styles.disabledButton
              ]} 
              onPress={handleAccept}
              disabled={!hasScrolledToEnd}
            >
              <Text style={[
                styles.acceptButtonText,
                !hasScrolledToEnd && styles.disabledButtonText
              ]}>
                Aceitar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    height: height * 0.85,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  eulaText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    textAlign: 'justify',
  },
  endMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  endText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 15,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default EULAModal; 
